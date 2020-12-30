"use strict";

//┌─[ RESOURCES ]───────────────────────────────┐
//│                                             │
//│ A List of on-line resource.                 │
//└─────────────────────────────────────────────┘
// https://stackoverflow.com/questions/3937000/chrome-extension-accessing-localstorage-in-content-script
// https://developer.chrome.com/extensions/manifest/externally_connectable
// https://medium.com/@AlonNola/communicating-between-webpages-and-chrome-extensions-f32c326bbfd9
// https://developer.chrome.com/extensions/messaging#external

//┌─[ RECORDER INJECTOR ]───────────────────────┐
//│                                             │
//│ Injects the recorder as saved by user when  │
//│ connected to Rhino.                         │
//└─────────────────────────────────────────────┘
//
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tabInfo) {
    // exit condition
    if (!_isHttpSchema(tabInfo)) {
        return;
    }

    // integration scripts
    var interval = setInterval(() => _injectRecorder(interval, tabId, changeInfo, tabInfo), 100);
});

// PRIVATE METHODS
//
function _isHttpSchema(tabInfo) {
    // setup conditions
    var isHttp = tabInfo.url.toLowerCase().startsWith("http");
    var isHttps = tabInfo.url.toLowerCase().startsWith("https");
    var isFtp = tabInfo.url.toLowerCase().startsWith("ftp");

    // get
    return isHttp || isHttps || isFtp;
}

// inject recorder scripts into the current tab
function _injectRecorder(interval, tabId, changeInfo, tabInfo) {
    // retry conditions
    if (changeInfo.status !== 'complete') {
        return;
    }
    clearInterval(interval);

    chrome.storage.sync.get(['ignoreList', 'recorder'], (result) => {
        // exit conditions
        if (_isIgnored(result, tabInfo) || !_isConnected(result)) {
            return;
        }

        // inject
        var recorderMode = _getRecorderMode(result);
        chrome.tabs.executeScript(tabId, { file: "js/" + recorderMode });
    });
}

function _isIgnored(result, tabInfo) {
    // setup conditions
    var isResult = !isNullOrEmpty(result);
    var isList = isResult && !isNullOrEmpty(result.ignoreList);

    // setup
    var knownServers = getKnownServers();
    var ignoreList = isList ? result.ignoreList : [];

    // setup conditions
    var isKnownServer = knownServers.includes(tabInfo.title);
    var ignored = isIgnored(ignoreList, tabInfo.url);

    // get
    return isKnownServer || ignored
}

function _isConnected(result) {
    // setup conditions
    var isResult = !isNullOrEmpty(result);
    var isRecorder = isResult && !isNullOrEmpty(result.recorder);
    var isData = isRecorder && !isNullOrEmpty(result.recorder.isConnected);

    // get
    return isData ? result.recorder.isConnected : false;
}

function _getRecorderMode(result) {
    // setup conditions
    var isResult = !isNullOrEmpty(result);
    var isRecorder = isResult && !isNullOrEmpty(result.recorder);
    var isMode = isRecorder && !isNullOrEmpty(result.recorder.recorderMode);

    // get
    return isMode ? result.recorder.recorderMode : 'recorder.manual.js';
}