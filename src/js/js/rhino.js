/**
 * Summary. Entry point for this injected scripts pipeline
 */
function main() {
    // setup
    var data = {
        endpoint: null,
        settings: null
    };

    // try to load current
    chrome.storage.sync.get(['last_endpoint'], function (endpoint) {
        data.endpoint = endpoint
        chrome.storage.sync.get(['widget_settings'], function (settings) {
            data.settings = settings;
            waitAndInject(data)
        });
    });

    /**
     * Summary. Executes a post request with onSuccess callback
     * 
     * @param {any} routing   Endpoint to which send the request
     * @param {any} data      Data Object to pass with this request as body
     * @param {any} onSuccess Success callback action
     * @param {any} onAlways  Finalize callback action, will always be executed
     */
    function post(routing, data, onSuccess, onAlways) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", routing, true);

        //Send the proper header information along with the request
        xhr.setRequestHeader("Content-Type", "application/json");

        // Call a function when the state changes.
        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status < 400) {
                console.log(xhr.response);
                //onSuccess(xhr.response)
            }
            else {
                console.log("Error [" + xhr.statusText + "] while calling the Web API on [" + routing + "]");
            }
        }

        xhr.send(data);
        // xhr.send(new Int8Array());
        // xhr.send(document);











        //$.ajax({
        //    url: routing,
        //    type: "POST",
        //    dataType: "json",
        //    contentType: "application/json; charset=utf-8",
        //    data: JSON.stringify(data),

        //    success: (data) => {
        //        onSuccess(data);
        //    },
        //    error: (e) => {
        //        console.log(e);
        //        console.log("Error while calling the Web API on [" + routing + "]");
        //    }
        //}).always(onAlways);
    }

    /**
     * Summary. Get an HTML which will be injected into the integrated application
     *
     * @param   {any} settings Last settings saved by the user
     *
     * @returns {any}          Ready to be injected HTML
     */
    function waitAndInject(data) {
        var observer = new MutationObserver(function (mutations) {
            // injection flag
            var flag_ui = document.getElementById('rh_ui_flag')
            var flag_data = document.getElementById('rh_ui_data');

            // setup conditions
            var isFlagUi = flag_ui !== null;
            var injected = isFlagUi && flag_ui.getAttribute('value') === 'true';
            var isFlagData = flag_data !== null;
            var populated = isFlagData && flag_data.getAttribute('value') === 'true';

            // exit conditions
            if (!injected || (injected && populated)) {
                return;
            }

            // apply after mutation
            document.getElementById('rh_run_automation').addEventListener('click', send, false);
            var capabilities = "";
            var driverOptions = "";
            try {
                var playbackOptions = data.settings.widget_settings.playback_options;

                var capabilitiesObj = JSON.parse(playbackOptions.capabilities);
                capabilities = JSON.stringify(capabilitiesObj, null, 4);

                var optionsObj = JSON.parse(playbackOptions.options);
                driverOptions = JSON.stringify(optionsObj, null, 4);

                document.getElementById('rh_driver_capabilities').value = capabilities;
                document.getElementById('rh_driver_options').value = driverOptions;
                document.getElementById('rh_web_driver').value = playbackOptions.web_driver;
                document.getElementById('rh_grid_endpoint').setAttribute('value', playbackOptions.grid_endpoint);                 
            }
            catch {
                console.log("Rhino: No capabilities or playback options found for this automation setup.")
            }            

            // flag update
            flag_data.setAttribute('value', 'true');
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        })
    }
}

// TODO: clean
function send() {
    chrome.storage.sync.get(['tests_repository'], function (result) {
        if (typeof (result.tests_repository) === 'undefined' || result.tests_repository.length === 0) {
            console.info("Rhino: No test cases have been loaded by this setup. Please click on <Reload Test Cases> button.");
            return;
        }
        console.info("Rhino: Test cases are now being executed, this can take a while. Please wait...");

        // TODO: build configuration & execute
        var capabilities = {}
        var onCapabilities = document.getElementById('rh_driver_capabilities').value;
        if (onCapabilities !== "") {
            capabilities = JSON.parse(onCapabilities)
        }

        var options = {}
        var onOptions = document.getElementById('rh_driver_options').value;
        if (onOptions !== "") {
            options = JSON.parse(onOptions)
        }
        var uiSettings = {
            driver: document.getElementById('rh_web_driver').value,
            driver_endpoint: document.getElementById('rh_grid_endpoint').value,
            driver_capabilities: capabilities,
            driver_options: options,
            tests_repository: result.tests_repository
        };

        // playback
        chrome.storage.sync.get(['last_endpoint'], function (endpoint) {
            // endpoint setup
            var onEndpoint = endpoint.last_endpoint.endsWith("/") ? endpoint.last_endpoint.slice(0, -1) : endpoint.last_endpoint;
            var playbackEndpoint = (onEndpoint + "/api/latest/rhino/execute");

            chrome.storage.sync.get(['i_c'], function (configuration) {
                // collect from UI
                configuration.i_c.providerConfiguration.capabilities.dryRun = (!document.getElementById("rh_create_execution").checked).toString();
                configuration.i_c.providerConfiguration.bugManager = document.getElementById("rh_open_close_bugs").checked;
                var maxParallelValue = document.getElementById("rh_max_parallel").value;
                var maxParallelNum = parseInt(maxParallelValue);
                var maxParallel = maxParallelNum <= 0 || isNaN(maxParallelNum) ? 1 : maxParallelNum;

                configuration.i_c.testsRepository = uiSettings.tests_repository;
                configuration.i_c.driverParameters[0].driver = uiSettings.driver;
                configuration.i_c.driverParameters[0].driverBinaries = uiSettings.driver_endpoint;
                configuration.i_c.driverParameters[0].capabilities = uiSettings.driver_capabilities;
                configuration.i_c.driverParameters[0].options = uiSettings.driver_options;
                configuration.i_c.engineConfiguration.maxParallel = maxParallel;

                chrome.storage.sync.get(['widget_settings'], function (settings) {
                    if (typeof (settings.widget_settings) === 'undefined') {
                        console.info("Rhino: No settings were saved for this setup. Please save settings under Rhino Widget.");
                        return;
                    }

                    post(playbackEndpoint, configuration.i_c, (testRun) => {
                        console.log(testRun);
                        console.info("Rhino: Test cases execution completed.");
                    });
                });
            });
        });
    });
}

function post(routing, data, onSuccess) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", routing, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            var testRun = JSON.parse(this.responseText);
            onSuccess(testRun);
        }
    }
    xhr.send(JSON.stringify(data));
}

main();