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

//┌─[ MIDDLEWARE API ]──────────────────────────┐
//│                                             │
//│ 1. Handles requests from client scripts.    │
//│ 2. Manage background indirect connection.   │
//└─────────────────────────────────────────────┘
//
// GET /api/ping
function ping(message, sender) {
    // setup
    message["issuer"] = sender;

    // TODO: handle ping message
    console.log(message);
}

function pingOut() {
    // setup
    var requestBody = getRequest(C_MIDDLEWARE, '/api/ping', {})

    // get
    port.postMessage(requestBody, (response) => {
        console.log(response);
    });
}

// GET /api/getSettings
function getSettings(message, sender) {
    // setup
    message["issuer"] = sender;

    // TODO: handle ping message
    console.log(message);
}

function getSettingsOut() {
    // setup
    var requestBody = getRequest(C_MIDDLEWARE, '/api/getSettings', {})

    // get
    port.postMessage(requestBody, (response) => {
        console.log(response);
    });
}