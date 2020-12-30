//┌─[ BASE ]────────────────────────────────────┐
//│                                             │
//│ > Warning!                                  │
//│ > The implementation must be JS vanilla. No │
//│ > dependencies or imports are allowed.      │
//│                                             │
//│ ## GENERAL                                  │
//│ Responsible for all the base and common     │
//│ component of the different integration      │
//│ script.                                     │
//└─────────────────────────────────────────────┘
//
"use strict";

//┌─[ SETUP ]───────────────────────────────────┐
//│                                             │
//│ Set all global, static and constants.       │
//└─────────────────────────────────────────────┘
//
//-- constants (A-Z)
//
//-- B --
var E_BUG_MANAGER = '#rh_open_close_bugs';
//
//-- C --
var E_CREATE_REPORT = '#rh_create_report';
//
//-- D --
var E_DRIVER_CAPABILITIES = '#rh_driver_capabilities';
var E_DRIVER_ENDPOINT = '#rh_grid_endpoint';
var E_DRIVER_OPTIONS = '#rh_driver_options';
var E_DRY_RUN = '#rh_create_execution';
//
//-- I --
var C_INTEGRATION = 'integration';
//
//-- M --
var E_MAX_PARALLEL = '#rh_max_parallel'
//
//-- R --
var E_RELOAD_TESTS = '#rh_reload_tests';
var E_RUN_AUTOMATION = '#rh_run_automation';
//
//-- W --
var E_WEB_DRIVER = '#rh_web_driver';
//
//-- event handlers
var port = chrome.runtime.connect({ name: C_INTEGRATION });
port.onMessage.addListener((message, sender) => {
    messageHandler(message, sender);
});

//┌─[ MIDDLEWARE API ]──────────────────────────┐
//└─────────────────────────────────────────────┘
//
//GET /api/getSettings
function getSettings(message, sender) {
    // setup
    message["issuer"] = sender;

    // exit conditions
    if (message.statusCode !== 200) {
        console.debug('Get-Settings = ' + message.statusCode);
        return;
    }

    // update
    _setSettings(message.data);

    // log
    console.debug('Update-IntegrationSettings = OK');
}

function getSettingsOut() {
    // setup
    var requestBody = new MessageBuilder()
        .withFrom(C_INTEGRATION)
        .withRoute('/api/getSettings')
        .build();

    // get
    port.postMessage(requestBody);
}

// PUT /api/putIntegrationSettings
function putIntegrationSettings(message, sender) {
    // setup
    message["issuer"] = sender;

    // exit conditions
    if (message.statusCode !== 201) {
        console.debug('Update-IntegrationSettings = ' + message.statusCode);
        return;
    }

    // log
    console.debug('Update-IntegrationSettings = OK');
}

function putIntegrationSettingsOut(data) {
    // setup
    var requestBody = new MessageBuilder()
        .withFrom(C_INTEGRATION)
        .withRoute('/api/putIntegrationSettings')
        .withData(data)
        .build();

    // get
    port.postMessage(requestBody);
}

// POST /api/invokeAutomation
function invokeAutomation(message, sender) {
    try {
        // setup
        message["issuer"] = sender;

        // log
        if (message.statusCode === 200) {
            console.log(message.data);
        }
        else {
            console.error(message);
        }

    } finally {
        // user interface        
        var element = _getUiElement(E_RUN_AUTOMATION);
        element.innerText = 'Run Automation';
        element.disabled = false;
    }
}

function invokeAutomationOut(data) {
    // setup
    var requestBody = new MessageBuilder()
        .withFrom(C_INTEGRATION)
        .withRoute('/api/invokeAutomation')
        .withData(data)
        .build();
    var element = _getUiElement(E_RUN_AUTOMATION);

    // user interface
    element.innerText = 'Running, please wait...';
    element.disabled = true;

    // send
    port.postMessage(requestBody);
}

//┌─[ UTILITIES ]───────────────────────────────┐
//│                                             │
//│ General purposes functions and helpers.     │
//└─────────────────────────────────────────────┘
//
/**
 * Summary: Populates the UI based on the last saved settings.
 *
 * @param {any} settings The settings by which to populate the automation.
 */
function setRhino(container, testsDataFactory, html) {
    // setup conditions
    var isContainer = typeof (container) !== 'undefined' && container !== null && container !== '';
    var isHtml = typeof (html) !== 'undefined' && html !== null && html !== '';

    // exit conditions
    if (isContainer === null) {
        return;
    }

    // build
    var _html = isHtml ? html : getRhinoWidgetHtml();
    var node = htmlToDom(_html);
    var _runTests = () => {
        var testCasesData = testsDataFactory(); // collect (by local collector)
        _invokeAutomation(testCasesData);          // run (by common runner)
    }

    // inject
    container.insertAdjacentElement('afterbegin', node);
    document.querySelector(E_RELOAD_TESTS).addEventListener('click', testsDataFactory, false);
    document.querySelector(E_RUN_AUTOMATION).addEventListener('click', _runTests, false);
    document.querySelector(E_DRIVER_CAPABILITIES).addEventListener('focusout', prettify, false);
    document.querySelector(E_DRIVER_OPTIONS).addEventListener('focusout', prettify, false);

    // settings
    getSettingsOut();
}

// PRIVATE METHODS
//
// run automation based on current connector
function _invokeAutomation(testCasesData) {
    // setup
    var userConfiguration = {
        testsRepository: testCasesData.testCases,
        driverParameters: _getDriverParameters(),
        engineConfiguration: _getEngingeConfiguration(),
        reportConfiguration: _getReportConfiguration(),
        connectorConfiguration: _getConnectorConfiguration(testCasesData),
        capabilities: testCasesData.capabilities
    };

    // run
    invokeAutomationOut(userConfiguration);
}

function _getDriverParameters() {
    // setup
    var driver = _getUiElement(E_WEB_DRIVER);
    var endpoint = _getUiElement(E_DRIVER_ENDPOINT);
    var capabilities = _getUiElement(E_DRIVER_CAPABILITIES);
    var options = _getUiElement(E_DRIVER_OPTIONS);

    // normalize
    driver = driver === -1 ? '' : driver.value;
    endpoint = endpoint === -1 ? '' : endpoint.value;
    capabilities = capabilities === -1 ? '{}' : capabilities.value;
    options = options === -1 ? '{}' : options.value;

    // build
    return {
        driver: driver,
        driverBinaries: endpoint,
        capabilities: JSON.parse(capabilities),
        options: JSON.parse(options)
    }
}

function _getEngingeConfiguration() {
    // setup
    var maxParallel = _getUiElement(E_MAX_PARALLEL);

    // normalize
    maxParallel = maxParallel === -1 ? 1 : maxParallel.value;

    // setup target
    return {
        maxParallel: maxParallel
    };
}

function _getReportConfiguration() {
    // setup configuration
    var element = _getUiElement(E_CREATE_REPORT);
    var isReport = element === -1 ? false : element.checked;

    // get
    return {
        localReport: isReport,
        addGravityData: isReport
    }
}

function _getConnectorConfiguration() {
    // setup    
    var dryRun = _getUiElement(E_DRY_RUN);
    var bugManager = _getUiElement(E_BUG_MANAGER);

    // get
    return {
        dryRun: dryRun === -1 ? true : !dryRun.checked,
        bugManager: bugManager === -1 ? false : bugManager.checked        
    }
}

// set user interface elements based on last saved settings
function _setSettings(settings) {
    // user interface
    _setUiElement(E_WEB_DRIVER, settings.playbackOptions.webDriver);
    _setUiElement(E_DRIVER_ENDPOINT, settings.playbackOptions.gridEndpoint);
    _setUiElement(E_DRIVER_CAPABILITIES, settings.playbackOptions.capabilities);
    _setUiElement(E_DRIVER_OPTIONS, settings.playbackOptions.options);
}

function _setUiElement(cssSelector, value) {
    // setup
    var element = _getUiElement(cssSelector);

    // exit conditions
    if (element === -1) {
        return;
    }

    // select element
    var tagName = element.tagName.toUpperCase();
    if (tagName === 'SELECT' || tagName === 'TEXTAREA') {
        element.value = value;
        return;
    }

    // set
    element.setAttribute('value', value);
}

function _getUiElement(cssSelector) {
    // setup
    var element = document.querySelector(cssSelector);

    // exit conditions
    if (typeof (element) === 'undefined' || element === null) {
        return -1;
    }

    // get
    return element;
}