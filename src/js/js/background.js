// https://stackoverflow.com/questions/3937000/chrome-extension-accessing-localstorage-in-content-script
// https://developer.chrome.com/extensions/manifest/externally_connectable
// https://medium.com/@AlonNola/communicating-between-webpages-and-chrome-extensions-f32c326bbfd9
// https://developer.chrome.com/extensions/messaging#external

// automatically load widget when navigating pages
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tabInfo) {
    // setup conditions
    var isHttp = tabInfo.url.toLowerCase().startsWith("http");
    var isHttps = tabInfo.url.toLowerCase().startsWith("https");
    var isFtp = tabInfo.url.toLowerCase().startsWith("ftp");

    // exit condition
    if(!isHttp && !isHttps && !isFtp ) {
        return;
    }

    // integration scripts
    var interval = setInterval(function () {
        if (changeInfo.status === 'complete') {
            clearInterval(interval);

            // 1. execute recording scripts if connected
            chrome.storage.sync.get(['is_connected'], function (result) {
                if (typeof (result.is_connected) !== 'undefined' && result.is_connected) {
                    chrome.tabs.executeScript(tabId, { file: "js/popup_widget.js" });
                }
            });            

            // 1. execute integration scripts (static HTML validation and injection)
            // 2. execute integration functional scripts (events and request)
            chrome.tabs.executeScript(tabId, { file: "js/rhino_integration.js" }, () => {
                chrome.tabs.executeScript(tabId, { file: "js/rhino.js" });
            });
        }
    }, 100);
});

// listen to content message
chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener((request, sender) => {
        if (sender.name === "elementRecorder") {
            chrome.storage.sync.set({ message: request }, () => {
                console.log('message: [' + JSON.stringify(request) + ']');
            });
        }
        else {
            console.log(request);
        }
    });
});

// listen to web page message
chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
    if (request.type === "putSettings") {
        chrome.storage.sync.set({ widget_settings: request.data }, () => {
            console.log(request.data);
        });
    }

    if (request.type === "getSettings") {
        chrome.storage.sync.get(['widget_settings'], (data) => {
            sendResponse(data.widget_settings);
        });
    }
});