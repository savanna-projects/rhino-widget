"use strict";

//┌─[ SETUP ]───────────────────────────────────┐
//│                                             │
//│ Set all global, static and constants.       │
//└─────────────────────────────────────────────┘
//
//-- constants & elements (A-Z)
//
//-- I --
var E_IGNORE_LIST = "#ignoreList";
//-- P --
var C_POPUP = 'popup';
//-- R --
var E_RECORDER_MODE = '#recorderMode'
//
//-- document state
var port = chrome.runtime.connect({ name: C_POPUP });
//
//-- event handlers
port.onMessage.addListener((message, sender) => {
    messageHandler(message, sender);
});

//┌─[ CONNECTION ]──────────────────────────────┐
//│                                             │
//│ Connect and disconnect Rhino Recorder from  │
//│ Rhino server.                               │
//└─────────────────────────────────────────────┘
//
/**
 * Opens and connects to Rhino Recorder.
 * 
 * @param endpoint {string} Rhino server endpoint to connect to.
 */
function openRecorder(endpoint) {
    chrome.windows.getAll({ populate: true }, (windows) => {
        try {
            // check if open
            var isExists = isServerOpen(windows)
            if (isExists) {
                return;
            }

            // get
            getRecorderOut();
        } catch (e) {
            console.info("Invoke-RecorderServer -Endpoint " + endpoint + " = 500 internal server error");
            console.log(e);
        }
    });
}

/**
 * Close and disconnect from Rhino Recorder.
 *
 * @param callabck {any} Callback function to execute when close is completed.
 */
function closeRecorder() {
    // setup
    var knownServers = getKnownServers();

    // close all tabs
    try {
        // state
        var state = {
            recorder: {
                isConnected: false
            }
        };
        chrome.storage.sync.set(state, () => {
            chrome.windows.getAll({ populate: true }, (windows) => {
                windows.forEach(window => {
                    window.tabs.forEach(tab => {
                        if (knownServers.includes(tab.title)) {
                            chrome.tabs.remove(tab.id);
                        }
                        else {
                            chrome.tabs.reload(tab.id);
                        }
                    });
                });
            });
        });
    } catch (e) {
        console.info("Close-Recorder = 500 internal server error");
        console.log(e);
    }
}

//┌─[ MIDDLEWARE API ]──────────────────────────┐
//└─────────────────────────────────────────────┘
//
// GET /api/getRecorder
function getRecorder(message, sender) {
    // setup
    message["issuer"] = sender;
    var ignoreList = $(E_IGNORE_LIST).val().split('\n');

    // exit conditions
    if (message.statusCode !== 201) {
        return;
    }

    // log
    console.debug("Get-Recorder = 201 created");

    // setup
    var recorderMode = $(E_RECORDER_MODE).val();
    var recorderScript = typeof (recorderMode) === 'undefined' || recorderMode === null || recorderMode === ''
        ? 'recorder.manual.js'
        : recorderMode;

    // state
    var state = {
        recorder: {
            isConnected: true,
            recorderMode: recorderScript
        }
    };
    chrome.storage.sync.set(state, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tab = tabs[0];

            if (isNullOrEmpty(tab)) {
                return;
            }

            if (isIgnored(ignoreList, tab.url)) {
                console.log('Page ' + tab.url + ' is ignored by Rhino Recorder')
                return;
            }

            chrome.tabs.executeScript(tab.id, { file: 'js/' + state.recorder.recorderMode }, () => {
                console.debug('Invoke-Script -' + state.recorder.recorderMode + ' = OK');
            });
        });
    });
}

function getRecorderOut() {
    // setup
    var requestBody = getRequest(C_POPUP, '/api/getRecorder', {})

    // get
    port.postMessage(requestBody);
}