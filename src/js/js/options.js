"use strict";

//┌─[ SETUP ]───────────────────────────────────┐
//│                                             │
//│ Set all global, static and constants.       │
//└─────────────────────────────────────────────┘
//
//-- constants & elements (A-Z)
//-- A --
var E_AS_OS_USER_CHECKBOX = '#asOsUser'
//-- B --
var E_BULB_CONNECT = "#bulbConnect";
var E_BULB_CONNECTION = "#bulbConnection";
//-- C --
var E_CONNECTOR_CAPABILITIES = "#connectorCapabilities";
var E_CONNECTOR_TYPE = "#connector";
//-- D ---
var E_DRIVER_CAPABILITIES = "#driverCapabilities";
var E_DRIVER_OPTIONS = "#driverOptions";
//-- G --
var E_GLOBAL_DATASOURCE = "#globalDatasource";
var E_DRIVER_ENDPOINT = "#gridEndpoint";
//-- M --
var E_MESSAGE_CONTAINER = '#rhinoMessageContainer';
//-- P --
var E_PASSEORD = "#password";
var E_PROJECT = "#project";
//-- R --
var E_RHINO_CHECK_CONNECTION = "#rhinoCheckConnection";
var E_RHINO_CONNECT = "#rhinoConnect";
var E_RHINO_PASSWORD = "#rhinoPassword";
var E_RHINO_SERVER = "#rhinoServer";
var E_RHINO_USER_NAME = "#rhinoUsername";
//-- S --
var E_SERVER_ADDRESS = "#collection";
var E_SETTINGS_APPLY = "#settingsApply";
var E_SETTINGS_EXPORT = "#settingsExport";
var E_SETTINGS_IMPORT = "#settingsImportFile";
//-- T --
var E_TEST_SUITE = "#testSuite";
//-- U --
var E_USER_NAME = "#username";
//-- W --
var E_WEB_DRIVER = "#webDriver";
//
//-- constants
//-- E --
var C_EMPTY_OPTION = "-1";
//-- G --
var C_GENERAL_ERROR = 'Something went wrong. Please check the console for additional information.';
var C_GENERAL_WARNG = 'Settings were not loaded. Please connect or provide a connectible endpoint or save settings at least once.'
//-- O --
var C_OPTIONS = 'options';
//
//-- routes
var R_CONNECTORS = "/api/latest/widget/connectors";
var R_DRIVERS = "/api/latest/widget/drivers";
//
//-- event handlers
//-- C --
document.querySelector(E_SETTINGS_IMPORT).addEventListener('change', importSettings, false);
document.querySelector(E_SETTINGS_APPLY).addEventListener('click', putSettingsOut);
document.querySelector(E_SETTINGS_EXPORT).addEventListener('click', exportSettings);
document.querySelector(E_RHINO_CHECK_CONNECTION).addEventListener('click', pingOut);
document.querySelector(E_RHINO_CONNECT).addEventListener('click', connectOut);
//-- D --
document.addEventListener('DOMContentLoaded', () => {
    getServerDataOut();
});
//-- F --
document.querySelector(E_CONNECTOR_CAPABILITIES).addEventListener('focusout', prettify);
document.querySelector(E_DRIVER_CAPABILITIES).addEventListener('focusout', prettify);
document.querySelector(E_DRIVER_OPTIONS).addEventListener('focusout', prettify);
document.querySelector(E_GLOBAL_DATASOURCE).addEventListener('focusout', prettify);
//-- M --
var port = chrome.runtime.connect({ name: C_OPTIONS });
port.onMessage.addListener((message, sender) => {
    messageHandler(message, sender);
});

//┌─[ MIDDLEWARE API ]──────────────────────────┐
//└─────────────────────────────────────────────┘
//
// GET /api/ping
function ping(message, sender) {
    // setup
    message["issuer"] = sender;

    // exit conditions
    if (message.statusCode !== 200) {
        return;
    }

    // user-interface
    setBulbCss(E_BULB_CONNECTION, 'text-success');
}

function pingOut() {
    // reset
    setBulbCss(E_BULB_CONNECTION, 'text-danger');

    // setup
    var endpoint = $(E_RHINO_SERVER).val();
    var requestBody = getRequest(C_OPTIONS, '/api/ping', { endpoint: endpoint });

    // get
    port.postMessage(requestBody);
}

// GET /api/getServerData
function getServerData(message, sender) {
    try {
        // setup
        message["issuer"] = sender;

        // exit conditions
        if (message.statusCode !== 200) {
            setRhinoMessage(E_MESSAGE_CONTAINER, 'alert-danger', message.data);
            return;
        }

        // apply to user interface
        loadSettings(message);
    } catch (e) {
        setRhinoMessage(E_MESSAGE_CONTAINER, 'alert-danger', C_GENERAL_ERROR);
        console.error(e);
        setBulbCss(E_BULB_CONNECT, 'text-danger');
    }
    finally {
        removeLoader();
    }
}

function getServerDataOut() {
    // setup
    var requestBody = getRequest(C_OPTIONS, '/api/getServerData', {})

    // get
    port.postMessage(requestBody);
}

// GET /api/connect
function connect(message, sender) {
    // setup
    message["issuer"] = sender;

    // exit conditions
    if (message.statusCode !== 200) {
        setRhinoMessage(E_MESSAGE_CONTAINER, 'alert-danger', message.data);
        return;
    }

    // user interface
    setBulbCss(E_BULB_CONNECT, 'text-success');
    loadEndpoint(message.data.endpoint);
    loadConnectors(message.data.connectors);
    loadDrivers(message.data.drivers);
}

function connectOut() {
    // user interface
    setBulbCss(E_BULB_CONNECT, 'text-danger');

    // setup
    var endpoint = $(E_RHINO_SERVER).val();

    // exit conditions
    if (typeof (endpoint) === 'undefined' || endpoint === null || endpoint === '') {
        return;
    }

    //  get
    var requestBody = getRequest(C_OPTIONS, '/api/connect', { endpoint: endpoint });
    port.postMessage(requestBody);
}

// PUT /api/putSettings
function putSettings(message, sender) {
    try {
        // setup
        message["issuer"] = sender;

        // exit conditions
        if (message.statusCode !== 201) {
            setRhinoMessage(E_MESSAGE_CONTAINER, 'alert-danger', message.data);
            return;
        }

        // success
        setRhinoMessage(E_MESSAGE_CONTAINER, 'alert-success', 'Successfully saved settings.');
    } catch (e) {
        console.error(e);
        setRhinoMessage(E_MESSAGE_CONTAINER, 'alert-danger', C_GENERAL_ERROR);        
    }
    finally {
        $(E_SETTINGS_APPLY).text('Save Settings');
        $(E_SETTINGS_APPLY).prop('disabled', false);
    }
}

function putSettingsOut() {
    try {
        // user interface
        $(E_SETTINGS_APPLY).prop('disabled', true);
        $(E_SETTINGS_APPLY).text('Saving...');

        // setup
        var data = {
            endpoint: $(E_RHINO_SERVER).val(),
            playbackOptions: getPlaybackOptionsState(),
            connectorOptions: getConnectorOptions(),
            rhinoOptions: getRhinoOptions()
        };
        var requestBody = getRequest(C_OPTIONS, '/api/putSettings', data);

        // send
        port.postMessage(requestBody);
    } catch (e) {        
        $(E_SETTINGS_APPLY).text('Save Settings');
        $(E_SETTINGS_APPLY).prop('disabled', false);
        console.error(e);
        setRhinoMessage(E_MESSAGE_CONTAINER, 'alert-danger', C_GENERAL_ERROR);
    }
}

//┌─[ SETTINGS: Load ]──────────────────────────┐
//│                                             │
//│ Settings load functions and helpers.        │
//└─────────────────────────────────────────────┘
//
function loadSettings(stateObj) {
    try {
        // exit conditions
        if (stateObj === null) {
            return;
        }

        // put
        loadDynamicData(stateObj);
    } catch (e) {
        setRhinoMessage(E_MESSAGE_CONTAINER, 'alert-danger', C_GENERAL_ERROR);
        console.error(e);
        setBulbCss(E_BULB_CONNECT, 'text-danger');
    }
}

function importSettings(settingsFile) {
    // setup
    var reader = new FileReader();
    var input = settingsFile.currentTarget;

    // read
    reader.readAsText(input.files[0]);

    // handler    
    reader.onload = () => {
        var json = reader.result;
        var statObj = JSON.parse(json);

        loadIntegrationSettings(statObj);
        loadPlaybackOptions(statObj);
        loadRhinoOptions(statObj);
    };
    reader.onerror = (e) => {
        setRhinoMessage(E_MESSAGE_CONTAINER, 'alert-danger', C_GENERAL_ERROR);
        console.error(e);
        setBulbCss(E_BULB_CONNECT, 'text-danger');
    };
}

function loadDynamicData(stateObj) {
    // setup: user-interface
    setBulbCss(E_BULB_CONNECT, 'text-danger');

    // setup
    var endpoint = stateObj.data.endpoint;
    var connectors = stateObj.data.connectors;
    var drivers = stateObj.data.drivers;
    var settings = stateObj.data.settings;

    // load server endpoint
    var isEndpoint = typeof (endpoint) !== 'undefined' && endpoint !== null && endpoint !== '';    
    if (!isEndpoint) {
        setRhinoMessage(E_MESSAGE_CONTAINER, 'alert-warning', C_GENERAL_WARNG);
        return;
    }

    // set endpoint
    endpoint = endpoint.endsWith('/')
        ? endpoint.data.substr(0, endpoint.data.length - 1)
        : stateObj.data.endpoint;    

    // get from Rhino Server: connectors & drivers
    loadEndpoint(endpoint);
    loadConnectors(connectors);
    loadDrivers(drivers);
    setBulbCss(E_BULB_CONNECT, 'text-success');

    // load settings
    var isSettings = typeof (settings) !== 'undefined' && settings !== null && settings !== '';
    if (!isSettings) {
        setRhinoMessage(E_MESSAGE_CONTAINER, 'alert-warning', C_GENERAL_WARNG);
        return;
    }
    loadIntegrationSettings(settings);
    loadPlaybackOptions(settings);
    loadRhinoOptions(settings);
}

function loadConnectors(connectors) {
    // get connectors element
    var connectorsList = $(E_CONNECTOR_TYPE);
    connectorsList.empty();

    // append
    $.each(connectors, (_, item) => {
        var html = '<option title="' + item.entity.description + '" value="' + item.key + '">' + item.entity.name + '</option>'
        connectorsList.append(html);
    });
}

function loadDrivers(drivers) {
    // get connectors element
    var driversList = $(E_WEB_DRIVER);
    driversList.empty();

    // append
    $.each(drivers, (_, item) => {
        var html = '<option value="' + item.key + '">' + item.key + '</option>'
        driversList.append(html);
    });
}

function loadEndpoint(endpoint) {
    $(E_RHINO_SERVER).val(endpoint);
}

function loadIntegrationSettings(stateObj) {
    $(E_CONNECTOR_TYPE).val(stateObj.connectorOptions.connector);
    $(E_SERVER_ADDRESS).val(stateObj.connectorOptions.collection);
    $(E_PROJECT).val(stateObj.connectorOptions.project);
    $(E_TEST_SUITE).val(stateObj.connectorOptions.testSuite);
    $(E_USER_NAME).val(stateObj.connectorOptions.username);
    $(E_PASSEORD).val(stateObj.connectorOptions.password);
    $(E_CONNECTOR_CAPABILITIES).val(stateObj.connectorOptions.capabilities);
    $(E_AS_OS_USER_CHECKBOX).prop('checked', stateObj.connectorOptions.asOsUser);
}

function loadPlaybackOptions(stateObj) {
    $(E_WEB_DRIVER).val(stateObj.playbackOptions.webDriver);
    $(E_DRIVER_ENDPOINT).val(stateObj.playbackOptions.gridEndpoint);
    $(E_DRIVER_CAPABILITIES).val(stateObj.playbackOptions.capabilities);
    $(E_DRIVER_OPTIONS).val(stateObj.playbackOptions.options);
}

function loadRhinoOptions(stateObj) {
    $(E_RHINO_USER_NAME).val(stateObj.rhinoOptions.username);
    $(E_RHINO_PASSWORD).val(stateObj.rhinoOptions.password);
}

//┌─[ SETTINGS: Save ]──────────────────────────┐
//│                                             │
//│ Settings save functions and helpers.        │
//└─────────────────────────────────────────────┘
function exportSettings() {
    try {
        // setup
        var stateObj = {
            playbackOptions: getPlaybackOptionsState(),
            connectorOptions: getConnectorOptions(),
            rhinoOptions: getRhinoOptions()
        };

        // save
        var onSettings = JSON.stringify(stateObj, null, 4);
        var vBlob = new Blob([onSettings], { type: "octet/stream" });
        var vName = 'rhino_settings.json';
        var vId = 'rhinoVirtualLink';
        var vUrl = window.URL.createObjectURL(vBlob);

        // build
        var vLink = document.createElement('a');
        vLink.setAttribute('id', vId);
        vLink.setAttribute('href', vUrl);
        vLink.setAttribute('download', vName);

        // execute
        vLink.click();

        // clean
        $("#" + vId).remove();
    } catch (e) {
        setRhinoMessage(
            E_MESSAGE_CONTAINER,
            'alert-danger',
            C_GENERAL_ERROR);
        console.error(e);
    }
}

function getPlaybackOptionsState() {
    return {
        webDriver: $(E_WEB_DRIVER + " option").length > 0 ? $(E_WEB_DRIVER + " option:selected").val() : C_EMPTY_OPTION,
        gridEndpoint: $(E_DRIVER_ENDPOINT).val(),
        capabilities: $(E_DRIVER_CAPABILITIES).val(),
        options: $(E_DRIVER_OPTIONS).val()
    };
}

function getConnectorOptions() {
    // shortcuts
    var connector = $(E_CONNECTOR_TYPE + " option").length > 0
        ? $(E_CONNECTOR_TYPE + " option:selected").val()
        : C_EMPTY_OPTION;

    // setup state object
    return {
        connector: connector,
        collection: $(E_SERVER_ADDRESS).val(),
        project: $(E_PROJECT).val(),
        testSuite: $(E_TEST_SUITE).val(),
        username: $(E_USER_NAME).val(),
        password: $(E_PASSEORD).val(),
        capabilities: $(E_CONNECTOR_CAPABILITIES).val(),
        asOsUser: $(E_AS_OS_USER_CHECKBOX)[0].checked
    };
}

function getRhinoOptions() {
    return {
        username: $(E_RHINO_USER_NAME).val(),
        password: $(E_RHINO_PASSWORD).val()
    };
}

//┌─[ UTILITIES ]───────────────────────────────┐
//│                                             │
//│ General purposes functions and helpers.     │
//└─────────────────────────────────────────────┘
//
function setBulbCss(element, cssClass) {
    // setup
    var onClass = $(element).attr("class").replace('text-danger', '').replace('text-success');
    var isCssClass = onClass.includes(cssClass);    

    // exit conditions
    if (isCssClass) {
        return;
    }

    // set
    onClass += " " + cssClass;
    $(element).attr('class', onClass);
}