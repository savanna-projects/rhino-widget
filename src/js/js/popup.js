const TITLE = "Rhino Widget - Action Settings Page - Cloud Native - Automation.Kdd.Agent";

// #region *** pipeline: connect widget ***
document.getElementById("connect").addEventListener("click", connectHandler, false);

function connectHandler(e) {
    // setup
    var endpoint = document.getElementById("endpoint").value;

    // setup conditions
    var isLocal = document.getElementById("is_local").checked;
    var isEndpoint = !(endpoint === undefined || endpoint === null || endpoint === "");

    // get endpoint
    if (!isEndpoint && isLocal) {
        endpoint = "https://localhost:5001/"
    }
    if (!isEndpoint && !isLocal) {
        endpoint = "https://rhino-widget.azurewebsites.net/"
    }
    document.getElementById("endpoint").value = endpoint

    // call widget
    callWidget();
}

function callWidget() {
    chrome.windows.getAll({ populate: true }, (windows) => {
        // clear if any old instance are open
        unloadWidget(windows);

        // create new connection
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            // setup
            settingsHandler();
            var id = tabs[0].id;
    
            // create widget window if not exists
            chrome.tabs.executeScript(id, { file: "js/popup_widget.js" }, () => {       
               chrome.windows.getAll({ populate: true }, (windows) => {
                   // check if open
                   var isExists = isWidgetExists(windows)
                   if (isExists) {
                       return;
                   }
    
                   // create if not
                   chrome.windows.create({
                       url: document.getElementById("endpoint").value,
                       type: "popup",
                       top: -50,
                       left: -50,
                       height: window.screen.height,
                       width: 600
                   });
               });
            });
        });        
    });
}

function settingsHandler() {
    // settings data to save
    var s = {
        endpoint: document.getElementById("endpoint").value
    };

    chrome.storage.sync.set({ settings: s }, () => {
        console.log('Saved connection settings: [' + JSON.stringify(s) + ']');
    });
}
// #endregion

// #region *** pipeline: disconnect     ***
document.getElementById("button_disconnect").addEventListener("click", disconnectHandler, false);

function disconnectHandler(e) {
    // constants
    const TITLE = "Rhino Widget - Action Settings Page - Cloud Native - Automation.Kdd.Agent";
    
    // settings data to save
    var s = {
        endpoint: ""
    };

    chrome.storage.sync.set({ settings: s }, () => {
        console.log('Saved connection settings: [' + JSON.stringify(s) + ']');

        // refresh tabs (remove all injected scripts)
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.reload(tab.id);
            });
            
            // close all widget open windows upon disconnect
            chrome.windows.getAll({ populate: true }, (windows) => {
                unloadWidget(windows)
            });
        });
    });
}
// #endregion

// TODO: reuse code here
function isWidgetExists(windows) {
    for (var i = 0; i < windows.length; i++) {
        for (var j = 0; j < windows[i].tabs.length; j++) {
            if (windows[i].tabs[j].title !== TITLE) {
                continue;
            }
            return true;
        }
    }
    return false;
}

function unloadWidget(windows) {
    for (var i = 0; i < windows.length; i++) {
        for (var j = 0; j < windows[i].tabs.length; j++) {
            if(windows[i].tabs[j].title !== TITLE) {
                continue;
            }
            chrome.windows.remove(windows[i].id);
        }
    }
}