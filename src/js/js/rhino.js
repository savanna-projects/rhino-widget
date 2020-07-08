function main() {
    waitAndInject();

    function send() {
        console.log(getConfiguration());
        console.log(getSettings());
        //var R_PLAYBACK = "/api/widget/playback";
        //var c = getConfiguration();

        //post("https://localhost:5001" + R_PLAYBACK, { config: c }, (testRun) => {
        //    console.log(testRun);
        //    publishTestRun(testRun);
        //}, () => console.log("Done")/*, () => $(E_PLAYBACK_PROGRESS).remove()*/);
    }

    function getConnector() {

    }

    function getSettings() {
        // setup
        var data = {};

        // try to load current
        chrome.storage.sync.get(['last_endpoint'], function (result) {
            data.endpoint = result
            chrome.storage.sync.get(['widget_settings'], function (result) {
                data.settings = result;
            });
        });

        // get settings
        return data;
    }

    function getConfiguration() {
        return {
            testsRepository: ["TPS-17"],
            elementsRepository: [],
            tolerance: 0,
            priority: 5,
            severity: 5,
            attempts: 1,
            failOnException: false,
            saveRequests: true,
            connector: "jira",
            errorOnExitCode: 10,
            reportingConfiguration: {
                reportOut: ".",
                reportOutArchive: false,
                reporters: ["reporterBasic", "reporterWarehouse"],
                dwhConnectionString: ""
            },
            engineConfiguration: {
                maxParallel: 5,
                elementSearchTimeout: 3000,
                pageLloadTimeout: 60000
            },
            driverParameters: {
                driver: "ChromeDriver",
                driverBinaries: "http://localhost:4444/wd/hub"
            }
        }
    }

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

    function waitAndInject() {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (!mutation.addedNodes) {
                    return
                }

                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var button = document.getElementById("rh_run_automation");
                    var isButton = button !== null;
                    var isProperty = isButton && button.getAttribute("data-rhino") === "false";
                    if (isProperty) {
                        button.addEventListener('click', send, false);
                        button.setAttribute("data-rhino", "true");
                        return;
                    }
                }
            })
        });
        observer.observe(document.body, {
            childList: true,
            subtree: false,
            attributes: false,
            characterData: false
        })
    }
}

main();