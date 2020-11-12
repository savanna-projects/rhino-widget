"use strict";

// #region *** WIDGET: repository    ***

// REPOSITORY: elements
// -- C --
var E_CONNECTOR_CAPABILITIES = "#connector_capabilities";
var E_CONNECTOR_TYPE = "#connector_type";
// -- D ---
var E_DRIVER_CAPABILITIES = "#driver_capabilities";
var E_DRIVER_OPTIONS = "#driver_options";
// -- G --
var E_GRID_ENDPOINT = "#grid_endpoint";
// -- P --
var E_PASSEORD = "#password";
var E_PROJECT = "#project";
// -- R --
var E_RHINO_PASSWORD = "#rhino_password";
var E_RHINO_USER_NAME = "#rhino_user_name";
// -- S --
var E_SERVER_ADDRESS = "#server_address";
var E_SETTINGS_APPLY = "#settings_apply";
// -- T --
var E_TEST_SUITE = "#test_suite";
// -- U --
var E_USER_NAME = "#user_name";
// -- W --
var E_WEB_DRIVER = "#web_driver";

// REPOSITORY: constants
// -- E --
var C_EMPTY_OPTION = "-1";

// REPOSITORY: routes
var R_CONNECTORS = "/api/latest/widget/connectors";
var R_DRIVERS = "/api/latest/widget/drivers";

// #endregion

/**
 * Summary. Clears page loader animation.
 */
$('#preloader').fadeOut('normall', function () {
    $(this).remove();
});

/**
 * Summary. Loads the last saved settings state from local storage.
 */
function loadSettings() {
    chrome.storage.sync.get(['widget_settings'], (stateObj) => {
        // exit conditions
        if (stateObj === null) {
            return;
        }

        // put
        loadDynamicData();
    });
}

function loadDynamicData() {
    chrome.storage.sync.get(['last_endpoint', 'widget_settings'], function (storage) {
        // load server endpoint
        if (typeof (storage.last_endpoint) === 'undefined' || storage.last_endpoint === null || storage.last_endpoint === '') {
            return;
        }

        // set endpoint
        var endpoint = storage.last_endpoint.endsWith('/')
            ? storage.last_endpoint.substr(0, storage.last_endpoint.length - 1)
            : storage.last_endpoint;

        // get from Rhino Server
        get(endpoint + R_CONNECTORS, (connectors) => {
            get(endpoint + R_DRIVERS, (drivers) => {
                loadConnectors(connectors);
                loadDrivers(drivers);
                loadAllSettings(storage.widget_settings);
            });
        });
    });
}

function loadConnectors(connectors) {
    // get connectors element
    var connectors_list = $(E_CONNECTOR_TYPE);

    // append
    $.each(connectors, (_, item) => {
        var html = '<option title="' + item.description + '" value="' + item.value + '">' + item.name + '</option>'
        connectors_list.append(html);
    });
}

function loadDrivers(drivers) {
    // get connectors element
    var drivers_list = $(E_WEB_DRIVER);

    // append
    $.each(drivers, (_, item) => {
        var html = '<option value="' + item + '">' + item + '</option>'
        drivers_list.append(html);
    });
}

function loadAllSettings(stateObj) {
    // connector options
    $(E_CONNECTOR_TYPE).val(stateObj.connector_options.connector_type);
    $(E_SERVER_ADDRESS).val(stateObj.connector_options.server_address);
    $(E_PROJECT).val(stateObj.connector_options.project);
    $(E_TEST_SUITE).val(stateObj.connector_options.test_suite);
    $(E_USER_NAME).val(stateObj.connector_options.user_name);
    $(E_PASSEORD).val(stateObj.connector_options.password);
    $(E_CONNECTOR_CAPABILITIES).val(stateObj.connector_options.capabilities);

    // playback options
    $(E_WEB_DRIVER).val(stateObj.playback_options.web_driver);
    $(E_GRID_ENDPOINT).val(stateObj.playback_options.grid_endpoint);
    $(E_DRIVER_CAPABILITIES).val(stateObj.playback_options.capabilities);
    $(E_DRIVER_OPTIONS).val(stateObj.playback_options.options);

    // rhino options
    $(E_RHINO_USER_NAME).val(stateObj.rhino_options.rhino_user_name);
    $(E_RHINO_PASSWORD).val(stateObj.rhino_options.rhino_password);
}

/**
 * Summary. Saves this widget settings state into local storage.
 */
function saveSettings() {
    var stateObj = {
        playback_options: getPlaybackOptionsState(),
        connector_options: getConnectorOptions(),
        rhino_options: getRhinoOptions()
    };

    // save to local storage
    chrome.storage.sync.set({ widget_settings: stateObj }, () => {        
        try {
            $(E_SETTINGS_APPLY).prop('disabled', true);
            $(E_SETTINGS_APPLY).text('Saving...');
            port.postMessage(stateObj);
        } catch (e) {
            console.log(e);
        }
        finally {
            $(E_SETTINGS_APPLY).text('Save Settings');
            $(E_SETTINGS_APPLY).prop('disabled', false);
        }
    });
}

function getPlaybackOptionsState() {
    return {
        web_driver: $(E_WEB_DRIVER + " option").length > 0 ? $(E_WEB_DRIVER + " option:selected").val() : C_EMPTY_OPTION,
        grid_endpoint: $(E_GRID_ENDPOINT).val(),
        capabilities: $(E_DRIVER_CAPABILITIES).val(),
        options: $(E_DRIVER_OPTIONS).val()
    };
}

function getConnectorOptions() {
    // shortcuts
    var con_tp = $(E_CONNECTOR_TYPE + " option").length > 0
        ? $(E_CONNECTOR_TYPE + " option:selected").val()
        : C_EMPTY_OPTION;

    // setup state object
    return {
        connector_type: con_tp,
        server_address: $(E_SERVER_ADDRESS).val(),
        project: $(E_PROJECT).val(),
        test_suite: $(E_TEST_SUITE).val(),
        user_name: $(E_USER_NAME).val(),
        password: $(E_PASSEORD).val(),
        capabilities: $(E_CONNECTOR_CAPABILITIES).val()
    };
}

function getRhinoOptions() {
    return {
        rhino_user_name: $(E_RHINO_USER_NAME).val(),
        rhino_password: $(E_RHINO_PASSWORD).val()
    };
}
// #endregion

document.addEventListener('DOMContentLoaded', loadSettings);
document.querySelector(E_SETTINGS_APPLY).addEventListener('click', saveSettings);