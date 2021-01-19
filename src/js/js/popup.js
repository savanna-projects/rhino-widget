"use strict";

//┌─[ SETUP ]───────────────────────────────────┐
//│                                             │
//│ Set all global, static and constants.       │
//└─────────────────────────────────────────────┘
//
//-- routes
var ROUTE_GET_ENDPOINT = '/api/getLastEndpoint';
var ROUTE_PING = '/api/ping';
//
//-- constants & elements (A-Z)
//-- E --
var E_ERROR_TEXT = '#errorText';
//-- I --
var E_IGNORE_LIST = '#ignoreList'
//-- L --
var C_LOCAL_ENDPOINT = 'https://localhost:9001';
//-- M --
var E_MESSAGE_CONTAINER = '#rhinoMessageContainer';
//-- P --
var C_POPUP = 'popup';
//-- R --
var E_RECORDER_CONNECT = '#recorderConnect';
var E_RECORDER_DISCONNECT = '#recorderDisconnect';
//-- T --
var C_RECORDER_TITLE = 'Rhino Recorder Client - nygGKTtD';
//
//-- document state
var port = chrome.runtime.connect({ name: C_POPUP });
//
//-- elements (A-Z)
//-- R --
var E_RHINO_ENDPOINT = '#rhinoEndpoint';
var E_RHINO_LOCAL = '#rhinoLocal';
//
//-- event handlers
port.onMessage.addListener((message, sender) => {
    messageHandler(message, sender);
});

document.addEventListener('DOMContentLoaded', () => {
    getRhinoEndpointOut();
    getIgnoreListOut();
    removeLoader();
});

document.querySelector(E_RECORDER_CONNECT).addEventListener('click', () => {
    // setup: endpoint
    putRhinoEndpointOut();

    // wait for endpoint to populate
    var interval = setInterval(() => {
        // get endpoint
        var endpoint = $(E_RHINO_ENDPOINT).val();

        // wait
        if (endpoint === '') {
            return;
        }

        // connect
        clearInterval(interval);

        // setup: ignore list
        putIgnoreListOut();

        // call
        openRecorder(endpoint);
    }, 100);
});

document.querySelector(E_RECORDER_DISCONNECT).addEventListener('click', () => {
    closeRecorder();
});

//┌─[ MIDDLEWARE API ]──────────────────────────┐
//└─────────────────────────────────────────────┘
//
// GET /api/getRhinoEndpoint
function getRhinoEndpoint(message, sender) {
    // setup
    message["issuer"] = sender;

    // exit conditions
    if (message.statusCode !== 200) {
        return;
    }

    // apply to user interface
    $(E_RHINO_ENDPOINT).val(message.data);
}

function getRhinoEndpointOut() {
    // setup
    var requestBody = getRequest(C_POPUP, '/api/getRhinoEndpoint', {})

    // get
    port.postMessage(requestBody);
}

// GET /api/putRhinoEndpoint
function putRhinoEndpoint(message, sender) {
    // setup
    message["issuer"] = sender;

    // apply to user interface
    $(E_RHINO_ENDPOINT).val(message.data);
}

function putRhinoEndpointOut() {
    // setup
    var elementEndpoint = $(E_RHINO_ENDPOINT).val();
    var isEndpoint = elementEndpoint !== '';
    var endpoint = isEndpoint ? elementEndpoint : C_LOCAL_ENDPOINT;

    // normalize
    if ($(E_RHINO_LOCAL)[0].checked) {
        endpoint = C_LOCAL_ENDPOINT;
    }

    // build
    var requestBody = getRequest(C_POPUP, '/api/putRhinoEndpoint', endpoint)

    // get
    port.postMessage(requestBody);
}

// GET /api/putIgnoreList
function putIgnoreList(message, sender) {
    // setup
    message["issuer"] = sender;

    // apply to user interface
    $(E_IGNORE_LIST).val(message.data.join('\n'));
}

function putIgnoreListOut() {
    // setup
    var list = $(E_IGNORE_LIST).val().split("\n");

    // build
    var requestBody = getRequest(C_POPUP, '/api/putIgnoreList', list)

    // get
    port.postMessage(requestBody);
}

// GET /api/getIgnoreList
function getIgnoreList(message, sender) {
    // setup
    message["issuer"] = sender;

    // exit conditions
    if (typeof (message.data) === 'undefined' || message.data === null || message.data.length === 0) {
        return;
    }

    // apply to user interface
    $(E_IGNORE_LIST).val(message.data.join('\n'));
}

function getIgnoreListOut() {
    // build
    var requestBody = getRequest(C_POPUP, '/api/getIgnoreList');

    // get
    port.postMessage(requestBody);
}