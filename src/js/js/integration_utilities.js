// INJECTOR UTILITIES
function HtmlToDom(html) {
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