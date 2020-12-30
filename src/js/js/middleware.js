"use strict";

//┌─[ SETUP ]───────────────────────────────────┐
//│                                             │
//│ Set all global, static and constants.       │
//└─────────────────────────────────────────────┘
//
//-- constants (A-Z)
//-- M --
var C_MIDDLEWARE = 'middleware';
//-- R --
var ROUTE_GET_SETTINGS = '/api/getSettings';
var ROUTE_PING = '/api/ping';
//
//-- document state
var port = chrome.runtime.connect({ name: C_MIDDLEWARE });
//
//-- event handlers
port.onMessage.addListener((message, sender) => {
    messageHandler(message, sender);
});

window.addEventListener("message", (event) => {
    windowMessageHandler(event);
});


//┌─[ MIDDLEWARE API ]──────────────────────────┐
//│                                             │
//│ 1. Handles requests from client scripts.    │
//│ 2. Manage background indirect connection.   │
//└─────────────────────────────────────────────┘
//
// GET /api/getSettingsProxy
function getSettingsProxyCallback(message, sender) {
    // setup
    message["issuer"] = sender;

    // handle the message
    var _message = JSON.stringify(message);
    window.postMessage({ action: 'send', message: _message }, "*");
}

function getSettingsProxy() {
    // setup
    var requestBody = getRequest(C_MIDDLEWARE, '/api/getSettings', {}, '/api/getSettingsProxyCallback')

    // get
    port.postMessage(requestBody);
}