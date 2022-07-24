"use strict";

//┌─[ SETUP ]───────────────────────────────────┐
//│                                             │
//│ Set all global, static and constants.       │
//└─────────────────────────────────────────────┘
//
//-- constants (A-Z)
//
//-- A --
var C_ACCEPTED_CONNECTIONS = [
    "middleware",
    "popup",
    "options",
    "integration",
    "recorder"
];
//-- B --
var C_BACKGROUND = "background";
//-- C --
var C_CONFIGURATION_NAME = "Rhino Automation - Widget";
//
//-- routes
var R_VERSION = "/api/v3"
var R_CONNECTORS = R_VERSION + "/meta/connectors";
var R_DRIVERS = R_VERSION + "/meta/drivers";
var R_EXECUTE = R_VERSION + "/rhino/configurations/invoke";
//
//-- state
var recorderWindow = null;
//
//-- event handlers
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tabInfo) {
    chrome.storage.sync.get(['ignoreList'], (result) => {
        // setup
        var ignoreList = isNullOrEmpty(result.ignoreList) ? [] : result.ignoreList;

        // setup conditions
        var isHttp = tabInfo.url.toUpperCase().startsWith("HTTP");
        var isFtp = tabInfo.url.toUpperCase().startsWith("FTP");
        var isFile = tabInfo.url.toUpperCase().startsWith("FILE");
        var ignored = isIgnored(ignoreList, tabInfo.url);

        // exit condition
        if ((!isHttp && !isFtp && !isFile) || ignored) {
            return;
        }

        // is injected
        if (getFlag()) {
            return;
        }

        // integration scripts
        var interval = setInterval(() => {
            if (changeInfo.status !== 'complete') {
                return;
            }
            clearInterval(interval);

            chrome.storage.sync.get(['recorderMode', 'isConnected'], (result) => {
                var isResult = typeof (result) !== 'undefined' && result !== null;
                var isMode = isResult && typeof (result.recorderMode) !== 'undefined' && result.recorderMode !== null;
                var isConnected = isResult && result.isConnected === true;
                var clientFile = isMode ? result.recorderMode : 'js/client.manual.js';

                if (!isConnected) {
                    return;
                }

                getRecorderClient(clientFile, false, () => {
                    console.debug('Update-Tab -ID ' + tabId + ' -File ' + clientFile + ' = OK');
                    setFlag(true);
                });
            });
        }, 100);
    });
});

//┌─[ API FACTORY ]─────────────────────────────┐
//│                                             │
//│ Calls background API request based on       │
//│ sender route.                               │
//└─────────────────────────────────────────────┘
//
chrome.extension.onConnect.addListener((port) => {
    port.onMessage.addListener((request, sender) => {
        // exit conditions
        var isEmpty = isNullOrEmpty(request.from);
        var isTrusted = !isEmpty && C_ACCEPTED_CONNECTIONS.includes(request.from);
        if (!isTrusted) {
            return;
        }

        try {
            // setup
            var actionName = request.route.substring(request.route.lastIndexOf('/') + 1, request.route.length);
            var parameters = [port, request, sender];
            var action = Reflect.get(this, actionName);
            var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

            // exit conditions
            if (typeof (action) !== 'function') {
                var responseBody = messageBuilder
                    .withStatusCode(404)
                    .withData("Invoke-Action -Route " + request.route + " = 404 not found")
                    .build();
                port.postMessage(responseBody);
                return;
            }

            // build
            return action.apply(null, parameters);
        } catch (e) {
            var exceptionBody = messageBuilder
                .withStatusCode(500)
                .withData("Invoke-Action -Route " + request.route + " = 500 Internal server error")
                .build();
            exceptionBody["stack"] = e;
            port.postMessage(exceptionBody);
        }
    });
});

//┌─[ BACKGROUND API ]──────────────────────────┐
//│                                             │
//│ 1. Handles requests from middleware script. │
//│ 2. Manage the state and storage.            │
//│ 3. REST Architecture.                       │
//└─────────────────────────────────────────────┘
//
// GET /api/ping
function ping(port, request, sender) {
    // setup
    var route = '/api/latest/ping'
    var endpoint = request.data.endpoint;
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    // exit conditions
    var isEndpoint = !(endpoint === undefined || endpoint === null || endpoint === "");
    if (!isEndpoint) {
        var badRequest = messageBuilder.withStatusCode(400).build();
        port.postMessage(badRequest);
        return;
    }

    // setup
    endpoint = endpoint.endsWith('/')
        ? endpoint.substr(0, endpoint.length - 1) + route
        : endpoint + route;

    // get
    try {
        get(endpoint, (response) => {
            var okResponse = messageBuilder.withStatusCode(200).withData(response).build();
            port.postMessage(okResponse);
        }, () => {
            var serverErrorResponse = messageBuilder.withStatusCode(500).withData(response).build();
            port.postMessage(serverErrorResponse);
        });
    } catch (e) {
        var errorResponse = messageBuilder
            .withStatusCode(500)
            .withData(e.message)
            .build();
        port.postMessage(errorResponse);
    }
}

// GET /api/connect
function connect(port, request, sender) {
    // connectors
    get(request.data.endpoint + R_CONNECTORS, (connectors) => {
        // drivers
        get(request.data.endpoint + R_DRIVERS,
            (drivers) => _onSuccess(port, request, {
                connectors: connectors,
                drivers: drivers,
                endpoint: request.data.endpoint,
                settings: {}
            }, sender),
            () => _onError(port, request.route, _getError500Message('Get-Drivers', request.route), sender));
    }, () => _onError(port, request.route, _getError500Message('Get-Connectors', request.route), sender));
}

// GET /api/getStatus
function getStatus(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    // get
    chrome.storage.sync.get(['isConnected', 'recorderMode'], (result) => {
        var data = {
            isConnected: result.isConnected,
            recorderMode: result.recorderMode
        }
        var responseBody = messageBuilder.withStatusCode(200).withData(data).build();
        port.postMessage(responseBody);
    });
}

// GET /api/getSettings
function getSettings(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    chrome.storage.sync.get(['rhinoSettings'], (result) => {
        // exit conditions
        if (isNullOrEmpty(result.rhinoSettings)) {
            var exceptionBody = messageBuilder.withStatusCode(404).withData('Get-Settings = 404 not found').build();
            port.postMessage(exceptionBody);
            return;
        }

        // get
        var responseBody = messageBuilder.withStatusCode(200).withData(result.rhinoSettings).build();
        port.postMessage(responseBody);
    });
}

// PUT /api/putSettings
function putSettings(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    // get
    chrome.storage.sync.set({ rhinoSettings: request.data }, () => {
        chrome.storage.sync.set({ rhinoEndpoint: request.data.endpoint }, () => {
            var responseBody = messageBuilder.withStatusCode(201).withData(request.data).build();
            port.postMessage(responseBody);
        });
    });
}

// GET /api/getRhinoEndpoint
function getRhinoEndpoint(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    chrome.storage.sync.get(['rhinoEndpoint'], (result) => {
        // exit conditions
        if (isNullOrEmpty(result.rhinoEndpoint)) {
            var exceptionBody = messageBuilder.withStatusCode(404).withData('Get-RhinoEndpoint = 404 not found').build();
            port.postMessage(exceptionBody);
            return;
        }

        // get
        var responseBody = messageBuilder.withStatusCode(200).withData(result.rhinoEndpoint).build();
        port.postMessage(responseBody);
    });
}

// PUT /api/putRhinoEndpoint
function putRhinoEndpoint(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    // get
    chrome.storage.sync.set({ rhinoEndpoint: request.data }, () => {        
        var responseBody = messageBuilder.withStatusCode(201).withData(request.data).build();
        port.postMessage(responseBody);
    });
}

// PUT /api/putIgnoreList
function putIgnoreList(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    // get
    chrome.storage.sync.set({ ignoreList: request.data }, () => {
        var responseBody = messageBuilder.withStatusCode(201).withData(request.data).build();
        port.postMessage(responseBody);
    });
}

// GET /api/getIgnoreList
function getIgnoreList(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    chrome.storage.sync.get(['ignoreList'], (result) => {
        // setup
        var ignoreList = [];

        // exit conditions
        if (!isNullOrEmpty(result.ignoreList) && result.ignoreList.length > 0) {
            ignoreList = result.ignoreList;
        }

        // get
        var responseBody = messageBuilder.withStatusCode(200).withData(ignoreList).build();
        port.postMessage(responseBody);
    });
}

// GET /api/getIntegrationSettings
function getIntegrationSettings(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    chrome.storage.sync.get(['integrationSettings'], (result) => {
        // exit conditions
        if (isNullOrEmpty(result.integrationSettings)) {
            var exceptionBody = messageBuilder.withStatusCode(404).withData('Get-Settings = 404 not found').build();
            port.postMessage(exceptionBody);
            return;
        }

        // get
        var responseBody = messageBuilder.withStatusCode(200).withData(result.integrationSettings).build();
        port.postMessage(responseBody);
    });
}

// PUT /api/putIntegrationSettings
function putIntegrationSettings(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    // get
    chrome.storage.sync.set({ integrationSettings: request.data }, () => {
        var responseBody = messageBuilder.withStatusCode(201).withData(request.data).build();
        port.postMessage(responseBody);
    });
}

// GET /api/getServerData
function getServerData(port, request, sender) {
    chrome.storage.sync.get(['rhinoEndpoint'], (endpointResult) => {
        chrome.storage.sync.get(['rhinoSettings'], (settingsResult) => {
            var data = {
                port: port,
                request: request,
                sender: sender,
                endpointResult: endpointResult,
                settingsResult: settingsResult
            };

            _getSettings(data);
        });
    });
}

function _getSettings(data) {
    // setup
    var endpoint = data.endpointResult.rhinoEndpoint;
    var messageBuilder = getMessageBuilder(C_BACKGROUND, data.request, data.sender);

    // exit conditions
    if (isNullOrEmpty(endpoint)) {
        var endpointBody = messageBuilder
            .withStatusCode(404)
            .withData('Get-RhinoEndpoint = 404 not found')
            .build();
        data.port.postMessage(endpointBody);
        return;
    }

    // settings
    var settings = !isNullOrEmpty(data.settingsResult)
        ? data.settingsResult.rhinoSettings
        : data.settingsResult;

    // connectors
    try {
        get(endpoint + R_CONNECTORS, (connectors) => {
            // drivers
            get(endpoint + R_DRIVERS,
                (drivers) => _onSuccess(data.port, data.request, {
                    connectors: connectors,
                    drivers: drivers,
                    endpoint: endpoint,
                    settings: settings
                }, data.sender),
                () => _onError(data.port, data.request, _getError500Message('Get-Drivers', data.request.route), data.sender));
        }, () => _onError(data.port, data.request, _getError500Message('Get-Connectors', data.request.route), data.sender));
    } catch (e) {
        var errorBody = messageBuilder
            .withStatusCode(500)
            .withData(e.message)
            .build();
        data.port.postMessage(errorBody);
    }
}

function _onSuccess(port, request, responseData, sender) {
    try {
        // setup
        var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

        // build
        var messageData = {
            endpoint: responseData.endpoint,
            connectors: JSON.parse(responseData.connectors),
            drivers: JSON.parse(responseData.drivers),
            settings: responseData.settings
        }

        // send
        var responseBody = messageBuilder.withStatusCode(200).withData(messageData).build();
        port.postMessage(responseBody);
    } catch (e) {
        var errorBody = messageBuilder.withStatusCode(500).withData(e.message).build();
        port.postMessage(errorBody);
    }
}

function _onError(port, request, responseData, sender) {
    try {
        // setup
        var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender).withStatusCode(500);
        var responseBody = messageBuilder.withData(responseData).build();

        // send
        port.postMessage(responseBody);
    } catch (e) {
        var errorBody = messageBuilder.withData(e.message).build();
        port.postMessage(errorBody);
    }
}

function _getError500Message(action, route) {
    return '$(action) -Route $(route) = 500 internal server error'
        .replace('$(action)', action)
        .replace('$(route)', route);
}

// GET /api/getConfiguration
function getConfiguration(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    chrome.storage.sync.get(['configuration'], (result) => {
        // exit conditions
        if (isNullOrEmpty(result.configuration)) {
            console.debug('Get-Configuration = 404 not found');
            return;
        }

        // get
        var responseBody = messageBuilder.withStatusCode(200).withData(result.configuration).build();
        port.postMessage(responseBody);
    });
}

// POST /api/invokeAutomation
function invokeAutomation(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    chrome.storage.sync.get(['rhinoEndpoint', 'rhinoSettings'], (result) => {
        // setup conditions
        var isEndpoint = !isNullOrEmpty(result.rhinoEndpoint);
        var isSettings = !isNullOrEmpty(result.rhinoSettings);

        // exit conditions
        if (!isEndpoint || !isSettings) {
            _postError(port, request, sender);
            return;
        }

        // setup
        var configuration = _initConfiguration(request.data, result.rhinoSettings);

        // save last configuration
        chrome.storage.sync.set({ configuration: configuration });

        // execute
        var onSuccess = (response) => {
            var responseBody = messageBuilder.withStatusCode(200).withData(response).build();
            port.postMessage(responseBody);
        }
        var onError = (event) => {
            var data = { response: event, message: 'Invoke-Automation = 500 internal server error' };
            var errorBody = messageBuilder.withStatusCode(500).withData(data).build();
            port.postMessage(errorBody);
        }
        var onAlways = (respose) => {
            console.log(respose);
        }
        post(result.rhinoEndpoint + R_EXECUTE, configuration, onSuccess, onError, onAlways);
    });
}

//TODO: pass capabilities as separate part of the settings
//TODO: clean capabilities from connector configuration
function _initConfiguration(request, settings) {
    var configuration = {
        name: C_CONFIGURATION_NAME,
        testsRepository: request.testsRepository,
        driverParameters: _getDriverParameters(request.driverParameters),
        authentication: _getAuthentication(settings.rhinoOptions),
        engineConfiguration: _getEngingeConfiguration(request.engineConfiguration, settings.engineOptions),
        screenshotsConfiguration: _getScreenshotConfiguration(settings.screenshotsOptions),
        reportConfiguration: _getReportConfiguration(request.reportConfiguration, settings.reportOptions),
        connectorConfiguration: _getConnectorConfiguration(request.connectorConfiguration, settings.connectorOptions)
    };

    // build from connector capabilities
    var capabilitiesStr = isNullOrEmpty(settings.connectorOptions.capabilities) ? "{}" : settings.connectorOptions.capabilities;
    var capabilitiesJsn = JSON.parse(capabilitiesStr);
    var capabilities = isNullOrEmpty(capabilitiesJsn.capabilities) ? capabilitiesJsn : capabilitiesJsn.capabilities;
    var capabilitiesResult = _getCapabilities(request.capabilities, capabilities);

    // update
    configuration["capabilities"] = capabilitiesResult;

    // get
    return configuration;
}

function _getDriverParameters(driverParameters) {
    // setup default
    var defaults =
    {
        driver: "ChromeDriver",
        driverBinaries: "http://localhost:4444/wd/hub",
        capabilities: {},
        options: {
            arguments: [
                "--ignore-certificate-errors",
                "--disable-popup-blocking"
            ]
        }
    }

    // get
    var output = _addOrReplace(driverParameters, defaults);

    return [
        output
    ];
}

function _getAuthentication(authentication) {
    // setup default values
    var defaults = {
        password: "",
        username: ""
    }

    // get
    return _addOrReplace(authentication, defaults);
}

function _getEngingeConfiguration(fromUser, fromSettings) {
    // setup default values
    var defaults = {
        maxParallel: 5,
        elementSearchingTimeout: 15000,
        pageLoadTimeout: 60000,
        retrunExceptions: true,
        returnPerformancePoints: true,
        returnEnvironment: true,
        terminateOnAssertFailure: false
    };

    // replace defaults by user and settings values
    defaults = isNullOrEmpty(fromSettings) ? defaults : _addOrReplace(fromSettings, defaults);
    return _addOrReplace(fromUser, defaults);
}

function _getScreenshotConfiguration(screenshotConfiguration) {
    // setup default values
    var defaults = {
        "keepOriginal": false,
        "returnScreenshots": true,
        "onExceptionOnly": false
    };

    // get
    return isNullOrEmpty(screenshotConfiguration)
        ? defaults
        : _addOrReplace(screenshotConfiguration, defaults);
}

function _getReportConfiguration(fromUser, fromSettings) {
    // setup default values
    var defaults = {
        localReport: false,
        addGravityData: true,
        reporters: []
    };

    // replace defaults by user and settings values
    defaults = isNullOrEmpty(fromSettings) ? defaults : _addOrReplace(fromSettings, defaults);
    return _addOrReplace(fromUser, defaults);
}

function _getConnectorConfiguration(fromUser, fromSettings) {
    // setup default values
    var defaults = {
        collection: "",
        password: "",
        username: "",
        project: "",
        bugManager: false,
        dryRun: true
    };

    // replace defaults by user and settings values
    defaults = isNullOrEmpty(fromSettings) ? defaults : _addOrReplace(fromSettings, defaults);
    var configuration = _addOrReplace(fromUser, defaults);

    // delete deprecated keys
    if (!isNullOrEmpty(configuration.capabilities)) {
        delete configuration.capabilities;
    }

    // get
    return configuration;
}

function _getCapabilities(fromUser, fromSettings) {
    // setup default values
    var defaults = {
        bucketSize: 15
    };

    // replace defaults by user and settings values
    defaults = isNullOrEmpty(fromSettings) ? defaults : _addOrReplace(fromSettings, defaults);
    return _addOrReplace(fromUser, defaults);
}

function _addOrReplace(source, target) {
    // iterate
    source = typeof (source) !== 'undefined' && source !== null && source !== ''
        ? source
        : {};

    for (var key in source) {
        var isValue = typeof (source[key]) !== 'undefined' && source[key] !== null && source[key] !== ''

        if (!isValue) {
            continue;
        }

        target[key] = source[key]
    }

    // get
    return target;
}

function _postError(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    var errorMessage = {
        method: 'Invoke-Automation = 404 not found',
        message:
            'Rhino endpoint or Rhino settings were not found. ' +
            'Please make sure you are connected to Rhino and you have saved your settings.'
    }
    var errorBody = messageBuilder.withStatusCode(404).withData(errorMessage).build();
    port.postMessage(errorBody);
}

// GET /api/getRecorder
function getRecorder(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    chrome.storage.sync.get(['rhinoEndpoint', 'recorder'], (result) => {
        // setup conditions
        var isEndpoint = !isNullOrEmpty(result.rhinoEndpoint);
        var isRecorder = !isNullOrEmpty(result.recorder);
        var isConnected = isRecorder && !isNullOrEmpty(result.recorder.isConnected) && result.recorder.isConnected;

        // exit condition
        if (!isEndpoint || (isConnected)) {
            var existsResponse = messageBuilder
                .withStatusCode(200)
                .withData('Get-Recorder = OK already open and/or connected')
                .build();
            port.postMessage(existsResponse);
            return;
        }

        // open
        recorderWindow = window.open(
            result.rhinoEndpoint,
            '_blank',
            'location=yes,height=' + window.screen.height.toString() + ',width=600,scrollbars=yes,status=yes');

        // get
        var createdResponse = messageBuilder.withStatusCode(201).withData('Get-Recorder = Created').build();
        port.postMessage(createdResponse);
    });
}

// POST /api/postRecorderMessage
function postRecorderMessage(port, request, sender) {
    // setup
    var messageBuilder = getMessageBuilder(C_BACKGROUND, request, sender);

    chrome.storage.sync.get(['recorder'], (recorderResult) => {
        // setup
        var isRecorder = !isNullOrEmpty(recorderResult.recorder);
        var isConnected = isRecorder && !isNullOrEmpty(recorderResult.recorder.isConnected) && recorderResult.recorder.isConnected;
        var recorder = isConnected ? recorderResult.recorder : "Get-Recorder = 404 not found (window and/or not connected)";
        var statusCode = isConnected ? 200 : 404;

        // build
        if (!isConnected) {
            var notFoundResponse = messageBuilder.withStatusCode(statusCode).withData(recorder).build();
            port.postMessage(notFoundResponse);
            return;
        }

        // dispatch
        recorderWindow.postMessage(request.data, "*");
    });
}