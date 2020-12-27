"use strict";

//┌─[ SETUP ]───────────────────────────────────┐
//│                                             │
//│ Set all global, static and constants.       │
//└─────────────────────────────────────────────┘
//
//-- constants
var C_CONFIGURATION_NAME = "Rhino Automation - Widget";
//
//-- routes
var R_CONNECTORS = "/api/latest/widget/connectors";
var R_DRIVERS = "/api/latest/widget/drivers";
var R_EXECUTE = "/api/latest/rhino/execute";
//
//-- event handlers
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tabInfo) {
    // setup conditions
    var isHttp = tabInfo.url.toUpperCase().startsWith("HTTP");
    var isFtp = tabInfo.url.toUpperCase().startsWith("FTP");
    var isFile = tabInfo.url.toUpperCase().startsWith("FILE");

    // exit condition
    if (!isHttp && !isFtp && !isFile) {
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

//┌─[ API FACTORY ]─────────────────────────────┐
//│                                             │
//│ Calls background API request based on       │
//│ sender route.                               │
//└─────────────────────────────────────────────┘
//
chrome.extension.onConnect.addListener((port) => {
    port.onMessage.addListener((request, sender) => {
        // exit conditions
        var isEmpty = typeof (request.from) === 'undefined' || request.from === null || request.from === '';
        var isMiddleware = request.from === 'middleware';
        var isPopup = request.from === 'popup';
        var isOptions = request.from === 'options';
        var isIntegration = request.from.lastIndexOf('integration') !== -1;
        if (isEmpty || (!isMiddleware && !isPopup && !isOptions && !isIntegration)) {
            return;
        }

        try {
            // setup
            var actionName = request.route.substring(request.route.lastIndexOf('/') + 1, request.route.length);
            var parameters = [port, request, sender];
            var action = window[actionName];

            // exit conditions
            if (typeof (action) !== 'function') {
                var responseBody = getResponse(
                    request.route,
                    404,
                    "Invoke-Action -Route " + request.route + " = 404 not found",
                    sender);
                port.postMessage(responseBody);
            }

            // build
            return action.apply(null, parameters);
        } catch (e) {
            var exceptionBody = getResponse(
                request.route,
                500,
                "Invoke-Action -Route " + request.route + " = 500 Internal server error",
                sender);
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

    // exit conditions
    var isEndpoint = !(endpoint === undefined || endpoint === null || endpoint === "");
    if (!isEndpoint) {
        var badRequest = getResponse(request.route, 400, {}, sender);
        port.postMessage(badRequest);
        return;
    }

    // setup
    endpoint = endpoint.endsWith('/')
        ? endpoint.substr(0, endpoint.length - 1) + route
        : endpoint + route;

    // get
    get(endpoint, (response) => {
        var ok = getResponse(request.route, 200, response, sender);
        port.postMessage(ok);
    }, () => {
        var internalServerError = getResponse(request.route, 500, response, sender)
        port.postMessage(internalServerError);
    });
}

// GET /api/connect
function connect(port, request, sender) {
    // connectors
    get(request.data.endpoint + R_CONNECTORS, (connectors) => {
        // drivers
        get(request.data.endpoint + R_DRIVERS,
            (drivers) => _onSuccess(port, request.route, {
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
    chrome.storage.sync.get(['isConnected', 'recorderMode'], (result) => {
        var responseBody = getResponse(request.route, 200, {
            isConnected: result.isConnected,
            recorderMode: result.recorderMode
        }, sender);

        // get
        port.postMessage(responseBody);
    });
}

// GET /api/getSettings
function getSettings(port, request, sender) {
    chrome.storage.sync.get(['rhinoSettings'], (result) => {
        // exit conditions
        if (typeof (result.rhinoSettings) === 'undefined' || result.rhinoSettings === null) {
            var exceptionBody = getResponse(request.route, 404, "Get-Settings = 404 not found", sender);
            port.postMessage(exceptionBody);
            return;
        }

        // get
        var responseBody = getResponse(request.route, 200, result.rhinoSettings, sender);
        port.postMessage(responseBody);
    });
}

// PUT /api/putSettings
function putSettings(port, request, sender) {
    chrome.storage.sync.set({ rhinoSettings: request.data }, () => {
        chrome.storage.sync.set({ rhinoEndpoint: request.data.endpoint });

        // get
        var responseBody = getResponse(request.route, 201, request.data, sender);
        port.postMessage(responseBody);
    });
}

// GET /api/getRhinoEndpoint
function getRhinoEndpoint(port, request, sender) {
    chrome.storage.sync.get(['rhinoEndpoint'], (result) => {
        // exit conditions
        if (typeof (result.rhinoEndpoint) === 'undefined' || result.rhinoEndpoint === null) {
            var exceptionBody = getResponse(request.route, 404, "Get-RhinoEndpoint = 404 not found", sender);
            port.postMessage(exceptionBody);
            return;
        }

        // get
        var responseBody = getResponse(request.route, 200, result.rhinoEndpoint, sender);
        port.postMessage(responseBody);
    });
}

// PUT /api/putRhinoEndpoint
function putRhinoEndpoint(port, request, sender) {
    chrome.storage.sync.set({ rhinoEndpoint: request.data }, () => {
        // get
        var responseBody = getResponse(request.route, 201, request.data, sender);
        port.postMessage(responseBody);
    });
}

// PUT /api/putIgnoreList
function putIgnoreList(port, request, sender) {
    chrome.storage.sync.set({ ignoreList: request.data }, () => {
        // get
        var responseBody = getResponse(request.route, 201, request.data, sender);
        port.postMessage(responseBody);
    });
}

// GET /api/getIgnoreList
function getIgnoreList(port, request, sender) {
    chrome.storage.sync.get(['ignoreList'], (result) => {
        // setup
        var ignoreList = [];

        // exit conditions
        if (typeof (result.ignoreList) !== 'undefined' && result.ignoreList !== null && result.ignoreList.length > 0) {
            ignoreList = result.ignoreList;
        }

        // get
        var responseBody = getResponse(request.route, 200, ignoreList, sender);
        port.postMessage(responseBody);
    });
}

// GET /api/getIntegrationSettings
function getIntegrationSettings(port, request, sender) {
    chrome.storage.sync.get(['integrationSettings'], (result) => {
        // exit conditions
        if (typeof (result.integrationSettings) === 'undefined' || result.integrationSettings === null) {
            var exceptionBody = getResponse(request.route, 404, "Get-Settings = 404 not found", sender);
            port.postMessage(exceptionBody);
            return;
        }

        // get
        var responseBody = getResponse(request.route, 200, result.integrationSettings, sender);
        port.postMessage(responseBody);
    });
}

// PUT /api/putIntegrationSettings
function putIntegrationSettings(port, request, sender) {
    chrome.storage.sync.set({ integrationSettings: request.data }, () => {
        // get
        var responseBody = getResponse(request.route, 201, request.data, sender);
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

    // exit conditions
    var isEndpoint = typeof (endpoint) !== 'undefined' && endpoint !== null;

    if (!isEndpoint) {
        var eendpointBody = getResponse(data.request.route, 404, "Get-RhinoEndpoint = 404 not found", data.sender);
        data.port.postMessage(eendpointBody);
        return;
    }

    // settings
    var settings = typeof (data.settingsResult) !== 'undefined' && data.settingsResult !== null
        ? data.settingsResult.rhinoSettings
        : data.settingsResult;

    // connectors
    get(endpoint + R_CONNECTORS, (connectors) => {
        // drivers
        get(endpoint + R_DRIVERS,
            (drivers) => _onSuccess(data.port, data.request.route, {
                connectors: connectors,
                drivers: drivers,
                endpoint: endpoint,
                settings: settings
            }, data.sender),
            () => _onError(data.port, data.request.route, _getError500Message('Get-Drivers', data.request.route), data.sender));
    }, () => _onError(data.port, data.request.route, _getError500Message('Get-Connectors', data.request.route), data.sender));
}

function _onSuccess(port, route, data, sender) {
    try {
        // deserialize
        var connectors = JSON.parse(data.connectors);
        var drivers = JSON.parse(data.drivers);
        var endpoint = data.endpoint;
        var settings = data.settings;

        // build
        var responseBody = getResponse(route, 200, {
            endpoint: endpoint,
            connectors: connectors,
            drivers: drivers,
            settings: settings
        }, sender);

        // send
        port.postMessage(responseBody);
    } catch (e) {
        var errorBody = getResponse(route, 500, e.message, sender);
        port.postMessage(errorBody);
    }
}

function _onError(port, route, clientMessage, sender) {
    try {
        // setup
        var responseBody = getResponse(route, 500, clientMessage, sender);

        // send
        port.postMessage(responseBody);
    } catch (e) {
        var errorBody = getResponse(route, 500, e.message, sender);
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
    chrome.storage.sync.get(['configuration'], (result) => {
        // exit conditions
        if (typeof (result.configuration) === 'undefined' || result.configuration === null || result.configuration === '') {
            console.debug('Get-Configuration = 404 not found');
            return;
        }

        // get
        var responseBody = getResponse(request.route, 200, result.configuration, sender);
        port.postMessage(responseBody);
    });
}

// POST /api/invokeAutomation
function invokeAutomation(port, request, sender) {
    chrome.storage.sync.get(['rhinoEndpoint'], (endpoint) => {
        chrome.storage.sync.get(['rhinoSettings'], (settings) => {
            // setup conditions
            var isEndpoint = typeof (endpoint.rhinoEndpoint) !== 'undefined' && endpoint.rhinoEndpoint !== null && endpoint.rhinoEndpoint !== '';
            var isSettings = typeof (settings.rhinoSettings) !== 'undefined' && settings.rhinoSettings !== null && settings.rhinoSettings !== '';

            // exit conditions
            if (!isEndpoint || !isSettings) {
                _postError(port, request, sender);
                return;
            }

            // setup
            var configuration = _initConfiguration(request.data, settings.rhinoSettings);

            // save last configuration
            chrome.storage.sync.set({ configuration: configuration });

            // execute
            var onSuccess = (response) => {
                var responseBody = getResponse(request.route, 200, response, sender);
                port.postMessage(responseBody);
            }
            var onError = (event) => {
                var data = { response: event, message: 'Invoke-Automation = 500 internal server error' };
                var errorBody = getResponse(request.route, 500, data, sender);
                port.postMessage(errorBody);
            }
            var onAlways = (respose) => {
                console.log(respose);
            }
            post(endpoint.rhinoEndpoint + R_EXECUTE, configuration, onSuccess, onError, onAlways);
        });
    });
}

function _initConfiguration(request, settings) {
    return {
        name: C_CONFIGURATION_NAME,
        testsRepository: request.testsRepository,
        driverParameters: _getDriverParameters(request.driverParameters),
        authentication: _getAuthentication(settings.rhinoOptions),
        engineConfiguration: _getEngingeConfiguration(request.engineConfiguration, settings.engineOptions),
        screenshotsConfiguration: _getScreenshotConfiguration(settings.screenshotsOptions),
        reportConfiguration: _getReportConfiguration(request.reportConfiguration, settings.reportOptions),
        connectorConfiguration: _getConnectorConfiguration(request.connectorConfiguration, settings.connectorOptions),
        capabilities: _getCapabilities(request.capabilities, settings.capabilities)
    };
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
        userName: ""
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
        userName: "",
        project: "",
        bugManager: false,
        dryRun: true
    };

    // replace defaults by user and settings values
    defaults = isNullOrEmpty(fromSettings) ? defaults : _addOrReplace(fromSettings, defaults);
    return _addOrReplace(fromUser, defaults);
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
    var errorMessage = {
        method: 'Invoke-Automation = 404 not found',
        message:
            'Rhino endpoint or Rhino settings were not found. ' +
            'Please make sure you are connected to Rhino and you have saved your settings.'
    }
    var errorBody = getResponse(request.route, 404, errorMessage, sender);
    port.postMessage(errorBody);
}

//┌─[ UTILITIES ]───────────────────────────────┐
//│                                             │
//│ General purposes functions and helpers.     │
//└─────────────────────────────────────────────┘
//
function getResponse(route, statusCode, data, issuer) {
    return {
        from: "background",
        route: route,
        statusCode: statusCode,
        data: data,
        issuer: issuer
    };
}