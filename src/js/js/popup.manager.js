"use strict";

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
    invokeRecorderServer(endpoint, (window) => {
        // log
        console.debug("Invoke-RecorderServer -Endpoint " + endpoint + " = 201 created");
        console.debug(window);

        // state
        chrome.storage.sync.set({ isConnected: true });
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
        chrome.storage.sync.set({ isConnected: false }, () => {
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

//┌─[ UTILITIES ]───────────────────────────────┐
//│                                             │
//│ General purposes functions and helpers.     │
//└─────────────────────────────────────────────┘
//
/**
 * Runs Rhino Recorder server in a new window.
 *
 * @param endpoint {string} Rhino server endpoint to connect to.
 * @param callabck {any}    Callback function to execute when run is completed.
 */
function invokeRecorderServer(endpoint, callback) {
    chrome.windows.getAll({ populate: true }, (windows) => {
        try {
            // check if open
            var isExists = isServerOpen(windows)
            if (isExists) {
                return;
            }

            // create if not
            var requestBody = {
                url: endpoint,
                type: "popup",
                top: -50,
                left: -50,
                height: window.screen.height,
                width: 600
            }
            chrome.windows.create(requestBody, (window) => {
                callback(window);
            });
        } catch (e) {
            console.info("Invoke-RecorderServer -Endpoint " + endpoint + " = 500 internal server error");
            console.log(e);
        }
    });
}