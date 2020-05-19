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

    var interval = setInterval(function () {
        if (changeInfo.status === 'complete') {
            clearInterval(interval);
            chrome.tabs.executeScript(tabId, { file: "js/popup_widget.js" });
        }
    }, 100);
});

// listen to content message
chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener((request, sender) => {
        if (sender.name == "elementRecorder") {
            chrome.storage.sync.set({ message: request }, () => {
                console.log('message: [' + JSON.stringify(request) + ']');
            });
        }
    });
});