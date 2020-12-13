// INJECTOR UTILITIES
function getHtml() {
    return `        
<div id="rh_rhino_module" style="margin: 15px;">
    <style type="text/css" scoped>
        .rh-title {
            box-sizing: border-box;
            font-family: 'Fira Sans', sans-serif;
            line-height: 1.3;
            margin: 0px;
            font-size: 25px;
            color: #d21e2b;
        }
        .rh-text-left {
            text-align: left;
        }
        .rh-middle {
            vertical-align: middle;
        }
        .rh-top {
            vertical-align: top;
        }
        .rh-input {
            box-sizing: border-box;
            margin: 0;
            font-family: 'Fira Sans', sans-serif;
            max-width: 100%;
            font-weight: 500 !important;
            border-radius: 3px;
            font-size: 13px;
            border: 1px solid #ececec;
            background: #fff;
            color: #111 !important;
            outline: none;
            width: 100%;
            padding: 8px;
            transition: .3s;
            margin-top: 0px;
        }
        .rh-text-area {
            min-height: 100px;
            font-family: monospace;
        }
        .rh-select {
            box-sizing: border-box;
            margin: 0;
            text-transform: none;
            font-family: 'Fira Sans', sans-serif;
            font-weight: 500 !important;
            font-size: 13px;
            background: #fff;
            color: #111 !important;
            outline: none;
            width: 100%;
            padding: 8px;
            transition: .3s;
            border-radius: 5px;
            border: 1px solid #ececec;
            margin-top: 0px;
        }
        .rh-label {
            font-family: 'Fira Sans', sans-serif;
            font-size: 15px;
            color: #999;
            line-height: 170%;
            text-align: left;
            box-sizing: border-box;
            display: inline-block;
            max-width: 100%;
            margin-bottom: 0px;
            font-weight: 700;
            margin-top: 0px;
        }
        .rh-dark-button {
            box-sizing: border-box;
            margin: 0;
            font: inherit;
            overflow: visible;
            text-transform: none;
            cursor: pointer;
            font-family: 'Fira Sans', sans-serif;
            outline: 0 none;
            border: none;
            margin-top: 0px;
            border-radius: 5px !important;
            min-width: 50%;
            background: #111;
            color: #fff;
            transition-duration: .3s;
            display: inline-block;
            font-size: 14px;
            font-weight: 500;
            padding: 5px 15px 5px 15px;
        }
            .rh-dark-button:hover {
                color: #fff;
                background: #d21e2b;
            }
    </style>
    <input type="hidden" id="rh_ui_flag" value="true" />
    <input type="hidden" id="rh_ui_data" value="false" />
    <div id="rh_rhino_module_heading">
        <h2 class="rh-title">Rhino Automation</h2>
    </div>

    <table style="width: auto;" cellpadding="3" cellspacing="3">
        <tr>
            <td class="rh-middle rh-text-left">
                <span class="rh-label" title="Browser or platform on which this test or set will run.">Browser (Platform):</span>
            </td>
            <td class="rh-middle rh-text-left">
                <select id="rh_web_driver" class="rh-input">
                    <option value="AndroidDriver">AndroidDriver</option>
                    <option value="ChromeDriver">ChromeDriver</option>
                    <option value="FirefoxDriver">FirefoxDriver</option>
                    <option value="IEDriverServer">IEDriverServer</option>
                    <option value="iOSDriver">iOSDriver</option>
                    <option value="MicrosoftWebDriver">MicrosoftWebDriver</option>
                    <option value="MockWebDriver">MockWebDriver</option>
                    <option value="SafariDriver">SafariDriver</option>
                </select>
            </td>
            <td class="rh-middle rh-text-left" colspan="2">
                <table>
                    <tr>
                        <td class="rh-middle rh-text-left"><input id="rh_create_execution" type="checkbox" style="margin-left: 5px;" /></td>
                        <td class="rh-middle rh-text-left"><span class="rh-label" title="If checked, Test Execution issue will be created for this run.">Create Execution</span></td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="rh-middle rh-text-left">
                <span class="rh-label" title="Web Driver location. Can be a local folder, Grid endpoint or 3rd party Grid endpoint.">Driver Endpoint:</span>
            </td>
            <td class="rh-middle rh-text-left">
                <input id="rh_grid_endpoint" class="rh-input" type="text" style="width: 100%" />
            </td>
            <td class="rh-middle rh-text-left" colspan="2">
                <table>
                    <tr>
                        <td class="rh-middle rh-text-left"><input id="rh_open_close_bugs" type="checkbox" style="margin-left: 5px;" /></td>
                        <td class="rh-middle rh-text-left"><span class="rh-label" title="If checked, Bug issue will be created for each failed test or - if already opened and test passed - Bug issue will be closed.">Open/Close Bugs</span></td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="rh-middle rh-text-left">
                <span class="rh-label" title="The maximum number of tests that will be executed in parallel.">Max Parallel Execution:</span>
            </td>
            <td class="rh-middle rh-text-left">
                <input id="rh_max_parallel" value="1" class="rh-input" type="number" style="width: 100%" />
            </td>
            <td class="rh-middle rh-text-left"></td>
            <td class="rh-middle rh-text-left"></td>
        </tr>
        <tr>
            <td class="rh-top rh-text-left">
                <span class="rh-label" title="The capabilities of the selected platform as supported by the respective vendor.">Driver Capabilities:</span>
            </td>
            <td class="rh-middle rh-text-left" colspan="3">
                <textarea id="rh_driver_capabilities" class="rh-input rh-text-area"></textarea>
            </td>
        </tr>
        <tr>
            <td class="rh-top rh-text-left">
                <span class="rh-label" title="The options of the selected platform as supported by the respective vendor.">Driver Options:</span>
            </td>
            <td class="rh-middle rh-text-left" colspan="3">
                <textarea id="rh_driver_options" class="rh-input rh-text-area"></textarea>
            </td>
        </tr>
        <tr>
            <td class="rh-middle rh-text-left"></td>
            <td class="rh-middle rh-text-left" colspan="3">
                <table>
                    <tr>
                        <td class="rh-middle rh-text-left"><button class="rh-dark-button" id="rh_run_automation" data-rhino="false" style="margin-right: 5px;">Run Automation</button></td>
                        <td class="rh-middle rh-text-left"><button class="rh-dark-button" id="rh_reload_tests" data-rhino="false">Reload Test Cases</button></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>
    `
}

function htmlToDom(html) {
    // set container
    var container = document.createElement('div');
    container.innerHTML = html;

    // return first child as DOM element
    return container;
}

function setConfiguration(integration) {
    var integration_configuration = {
        name: "Rhino Automation",
        testsRepository: [],
        driverParameters: [
            {
                driver: "",
                driverBinaries: "",
                capabilities: {},
                options: {}
            }
        ],
        authentication: {
            password: "",
            userName: ""
        },
        engineConfiguration: {
            maxParallel: 5,
            elementSearchingTimeout: 15000,
            pageLoadTimeout: 60000,
            retrunExceptions: true,
            returnPerformancePoints: true,
            returnEnvironment: true,
            terminateOnAssertFailure: false
        },
        screenshotsConfiguration: {
            "keepOriginal": false,
            "returnScreenshots": true,
            "onExceptionOnly": false
        },
        reportConfiguration: {
            localReport: false,
            addGravityData: false
        },
        connectorConfiguration: {
            connector: integration.connector,
            collection: "",
            password: "",
            userName: "",
            project: "",
            bugManager: false,
            dryRun: true
        },
        capabilities: {
            bucketSize: 15
        }
    }

    chrome.storage.sync.get(['widget_settings'], function (result) {
        if (typeof (result.widget_settings) === 'undefined') {
            console.info("Rhino: No settings were saved for this setup. Please save settings under Rhino Widget.");
            return;
        }

        // apply settings: credentials
        integration_configuration.authentication.userName = result.widget_settings.rhino_options.rhino_user_name;
        integration_configuration.authentication.password = result.widget_settings.rhino_options.rhino_password;

        // apply settings: automation provider
        integration_configuration.connectorConfiguration.collection = result.widget_settings.connector_options.server_address;
        integration_configuration.connectorConfiguration.userName = result.widget_settings.connector_options.user_name;
        integration_configuration.connectorConfiguration.password = result.widget_settings.connector_options.password;
        integration_configuration.connectorConfiguration.project = result.widget_settings.connector_options.project;
        integration_configuration.connectorConfiguration.asOsUser = result.widget_settings.connector_options.as_os_user;

        chrome.storage.sync.set({ i_c: integration_configuration }, function () {
            console.log("Rhino: Integration configuration saved.")
        });
    });
}

// TODO: pass known integrations from the Widget to improve performance
function getKnownIntegration() {
    // static integrations collection
    var knownIntegrations = [
        getXRayOnPrem(),
        getXRayCloud(),
        getGurockCloud(),
        getAzure()
    ]

    // iterate
    for (var i = 0; i < knownIntegrations.length; i++) {

        if (typeof (knownIntegrations[i]) === "undefined" || knownIntegrations[i] === null) {
            continue;
        }

        var isKnown = knownIntegrations[i].validator;

        if (isKnown) {
            return knownIntegrations[i];
        }
    }

    // default
    return "-1";
}

function waitAndInject() {
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            var isFlag = document.getElementById("rh_ui_flag") !== null; // already injected
            if (isFlag) {
                return;
            }

            if (!mutation.addedNodes) {
                return
            }

            var index = mutation.addedNodes.length === 0 ? -1 : 0; // handles 0 length mutation
            for (var i = index; i < mutation.addedNodes.length; i++) {
                var integration = getKnownIntegration();                
                var isContainer = integration !== null;

                if (isContainer) {                    
                    var isKnown = integration !== "-1";
                    if (!isKnown) {
                        continue;
                    }
                    integration.injector();
                    setConfiguration(integration);
                    return;
                }
            }
        })
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: false
    })
}