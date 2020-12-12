"use strict";

// #region *** WIDGET: repository    ***

// REPOSITORY: elements
// -- A --
var E_AS_OS_USER = '#as_os_user'
var E_AS_OS_USER_CHECKBOX = '#as_os_user_checkbox'
// -- B --
var E_BULB_CONNECT = "#bulb_connect";
var E_BULB_CONNECTION = "#bulb_connection";
// -- C --
var E_CONNECTOR_CAPABILITIES = "#connector_capabilities";
var E_CONNECTOR_TYPE = "#connector_type";
// -- D ---
var E_DRIVER_CAPABILITIES = "#driver_capabilities";
var E_DRIVER_OPTIONS = "#driver_options";
// -- G --
var E_GLOBAL_DATASOURCE = "#global_datasource";
var E_GRID_ENDPOINT = "#grid_endpoint";
// -- P --
var E_PASSEORD = "#password";
var E_PROJECT = "#project";
// -- R --
var E_RHINO_CHECK_CONNECTION = "#rhino_check_connection";
var E_RHINO_CONNECT = "#rhino_connect";
var E_RHINO_PASSWORD = "#rhino_password";
var E_RHINO_SERVER = "#rhino_server";
var E_RHINO_USER_NAME = "#rhino_user_name";
// -- S --
var E_SERVER_ADDRESS = "#server_address";
var E_SETTINGS_APPLY = "#settings_apply";
var E_SETTINGS_EXPORT = "#settings_export";
var E_SETTINGS_IMPORT = "#settings_import_file";
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

function loadOptionsPipeline() {
    loadNavbar();
    loadSettings();
}

function loadNavbar() {
    if ($(window).width() <= 1200) {
        return;
    }

    $('ul.nav li.dropdown').hover(function () {
        $(this).find('.dropdown-menu').stop(true, true).delay(100).fadeIn(300);
    }, function () {
        $(this).find('.dropdown-menu').stop(true, true).delay(100).fadeOut(300);
    });
}

function connect() {
    // reset
    setBulbCss(E_BULB_CONNECT, 'text-danger');

    try {
        // setup
        var endpoint = $(E_RHINO_SERVER).val();

        // setup conditions
        var isEndpoint = !(endpoint === undefined || endpoint === null || endpoint === "");

        // get endpoint
        if (!isEndpoint) {
            endpoint = "https://localhost:9001/"
        }
        endpoint = endpoint.endsWith('/')
            ? endpoint.substr(0, endpoint.length - 1)
            : endpoint;

        // setup
        $(E_RHINO_SERVER).val(endpoint);

        // connect
        chrome.storage.sync.set({ last_endpoint: endpoint }, () => {
            get(endpoint + R_CONNECTORS, (connectors) => {
                get(endpoint + R_DRIVERS, (drivers) => {
                    loadConnectors(connectors);
                    loadDrivers(drivers);
                    setBulbCss(E_BULB_CONNECT, 'text-success');
                });
            });
        });
    } catch (e) {
        console.error(e);
        setBulbCss(E_BULB_CONNECT, 'text-danger');
    }
}

function checkConnection() {
    // reset
    setBulbCss(E_BULB_CONNECTION, 'text-danger');

    // setup
    var route = '/api/latest/ping'
    var endpoint = $(E_RHINO_SERVER).val();

    // exit conditions
    var isEndpoint = !(endpoint === undefined || endpoint === null || endpoint === "");
    if (!isEndpoint) {
        return;
    }

    // setup
    endpoint = endpoint.endsWith('/')
        ? endpoint.substr(0, endpoint.length - 1) + route
        : endpoint + route;

    // get
    get(endpoint, (response) => {
        console.log(response);
        setBulbCss(E_BULB_CONNECTION, 'text-success');
    });
}

/**
 * Summary. Loads the last saved settings state from local storage.
 */
function loadSettings() {
    try {
        chrome.storage.sync.get(['widget_settings'], (stateObj) => {
            // exit conditions
            if (stateObj === null) {
                return;
            }

            // put
            loadDynamicData();
        });
    } catch (e) {
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
        loadAllSettings(statObj);
    };
    reader.onerror = (e) => {
        console.log(e);
    };
}

function loadDynamicData() {
    setBulbCss(E_BULB_CONNECT, 'text-danger');
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
                loadAllSettings(storage.widget_settings, endpoint);
                setBulbCss(E_BULB_CONNECT, 'text-success');
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

function loadAllSettings(stateObj, rhinoServer) {
    // connector options
    var endpoint = stateObj.last_endpoint
    var isEndpoint = !(endpoint === undefined || endpoint === null || endpoint === "");
    endpoint = isEndpoint ? endpoint : rhinoServer;

    $(E_RHINO_SERVER).val(endpoint);
    $(E_CONNECTOR_TYPE).val(stateObj.connector_options.connector_type);
    $(E_SERVER_ADDRESS).val(stateObj.connector_options.server_address);
    $(E_PROJECT).val(stateObj.connector_options.project);
    $(E_TEST_SUITE).val(stateObj.connector_options.test_suite);
    $(E_USER_NAME).val(stateObj.connector_options.user_name);
    $(E_PASSEORD).val(stateObj.connector_options.password);
    $(E_CONNECTOR_CAPABILITIES).val(stateObj.connector_options.capabilities);

    var osUser = stateObj.connector_options.as_os_user;
    $(E_AS_OS_USER).attr('value', osUser.toString());
    $(E_AS_OS_USER_CHECKBOX).attr('class', osUser ? 'fa fa-check-square-o' : 'fa fa-square-o');

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
        last_endpoint: $(E_RHINO_SERVER).val(),
        playback_options: getPlaybackOptionsState(),
        connector_options: getConnectorOptions(),
        rhino_options: getRhinoOptions()
    };

    // save to local storage
    chrome.storage.sync.set({ widget_settings: stateObj }, () => {        
        try {
            $(E_SETTINGS_APPLY).prop('disabled', true);
            $(E_SETTINGS_APPLY).text('Saving...');
        } catch (e) {
            console.log(e);
        }
        finally {
            $(E_SETTINGS_APPLY).text('Save Settings');
            $(E_SETTINGS_APPLY).prop('disabled', false);
        }
    });
}

function exportSettings() {
    try {
        // setup
        var stateObj = {
            playback_options: getPlaybackOptionsState(),
            connector_options: getConnectorOptions(),
            rhino_options: getRhinoOptions()
        };

        // save
        var onSettings = JSON.stringify(stateObj, null, 4);
        var vBlob = new Blob([onSettings], { type: "octet/stream" });
        var vName = 'rhino_settings.json';
        var vId = 'rh_virtual_link';
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
        console.log(e);
    }
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
        capabilities: $(E_CONNECTOR_CAPABILITIES).val(),
        as_os_user: $(E_AS_OS_USER).attr('value') === "true" ? true : false
    };
}

function getRhinoOptions() {
    return {
        rhino_user_name: $(E_RHINO_USER_NAME).val(),
        rhino_password: $(E_RHINO_PASSWORD).val()
    };
}

function prettify(element) {
    try {
        // setup
        var json = $(element.currentTarget).val();

        // prettify
        var objt = JSON.parse(json);
        json = JSON.stringify(objt, null, 4);

        // set
        $(element.currentTarget).val(json);
    } catch (e) {
        alert('Invalid JSON in ' + $(element.currentTarget).attr('name') + ', please verify and fix the errors.');
    }
}
// #endregion

// Utility Scripts
function asOsUser() {
    // setup
    var hidden = document.querySelector(E_AS_OS_USER);
    var checkbox = document.querySelector(E_AS_OS_USER_CHECKBOX);
    var value = hidden.getAttribute('value');
    var faClass = 'fa fa-square-o'

    // switch
    var newValue = value === 'true' ? 'false' : 'true';
    hidden.setAttribute('value', newValue);

    // set
    if (typeof (newValue) !== 'undefined' && newValue === 'true') {
        faClass = 'fa fa-check-square-o'
    }

    // set
    checkbox.setAttribute('class', faClass);
}

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

// document
document.addEventListener('DOMContentLoaded', loadOptionsPipeline);

// focus out
document.querySelector(E_CONNECTOR_CAPABILITIES).addEventListener('focusout', prettify);
document.querySelector(E_DRIVER_CAPABILITIES).addEventListener('focusout', prettify);
document.querySelector(E_DRIVER_OPTIONS).addEventListener('focusout', prettify);
document.querySelector(E_GLOBAL_DATASOURCE).addEventListener('focusout', prettify);

// click
document.querySelector(E_SETTINGS_APPLY).addEventListener('click', saveSettings);
document.querySelector(E_SETTINGS_EXPORT).addEventListener('click', exportSettings);
document.querySelector(E_AS_OS_USER_CHECKBOX).addEventListener('click', asOsUser);
document.querySelector(E_RHINO_CHECK_CONNECTION).addEventListener('click', checkConnection);
document.querySelector(E_RHINO_CONNECT).addEventListener('click', connect);

// change
document.querySelector(E_SETTINGS_IMPORT).addEventListener('change', importSettings, false);