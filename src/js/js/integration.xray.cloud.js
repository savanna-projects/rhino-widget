//┌─[ INTERFACE ]───────────────────────────────┐
//│                                             │
//│ > Warning!                                  │
//│ > The implementation must be JS vanilla. No │
//│ > dependencies or imports are allowed.      │
//│                                             │
//│ ## GENERAL                                  │
//│ Responsible for injecting Rhino Widget into │
//│ the relevant page of the A.L.M.             │
//│                                             │
//│ ## CONNECTION                               │
//│ 1. A connection to background using port.   │
//│ 2. Use the background API to save data.     │
//│ 3. Storage key is integrationSettings.      │
//│ 4. GET endpoint /api/getIntegrationSettings.│
//│ 5. PUT endpoint /api/putIntegrationSettings.│
//│                                             │
//│ ## METHODS                                  │
//│ * confirmSite()                             │
//│ * getContainer()                            │
//│ * getConnectorCapabilities()                │
//│ * getTestCases()                            │
//│ * startRhino(interval)                      │
//└─────────────────────────────────────────────┘
//
"use strict";

function mainXrayCloud() {
    //┌─[ SETUP ]───────────────────────────────────┐
    //│                                             │
    //│ Set all global, static and constants.       │
    //└─────────────────────────────────────────────┘
    //
    //-- constants (A-Z)
    //
    //-- C --
    var C_CONNECTOR = "connector_xray_cloud";
    var C_CONTAINER_PATH = "//div[contains(@data-test-id,'issue.views.issue-details.issue-layout.left-most-column')]";

    //┌─[ INTEGRATION INTERFACE ]───────────────────┐
    //│                                             │
    //│ An iImplementation of the integration API.  │
    //└─────────────────────────────────────────────┘
    //
    /**
    * Summary. Gets a value indicates if the page you are at is compliant with
    *          the conditions for running test cases.
    * 
    * @returns {boolean} True if compliant; False if not.
    */
    function confirmSite() {
        // setup conditions
        var isPath = document
            .evaluate(C_CONTAINER_PATH, document, null, XPathResult.BOOLEAN_TYPE, null)
            .booleanValue;
        var isUrl = window.location.href.includes("atlassian.net")

        // assert
        return isPath && isUrl;
    }

    /**
    * Summary. Gets the container element on the site. Rhino Widget HTML will
    *          be injected into this container.
    *
    * @param {any} container The container into which to inject Rhino Widget HTML.
    */
    function getContainer() {
        // setup
        var path = C_CONTAINER_PATH;

        // get
        return document
            .evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
            .singleNodeValue;
    }

    /**
    * Summary. Gets a collection of connector capabilities based on the site state
    *
    * @returns {any} A collection capabilities.
    */
    function getConnectorCapabilities() {
        return {};
    }

    /**
    * Summary. Gets the test cases (runnable entities) from the page.
    *
    * @returns {Array} A collection of test cases (runnable entities).
    */
    function getTestCases() {
        // extract issue id
        var path = "//div[contains(@data-test-id,'current-issue-container')]//a/span/span";
        var element = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        // setup
        var testCases = [];

        // validate
        if (isNullOrEmpty(element)) {
            return testCases;
        }

        // add to collection
        testCases.push(element.textContent);

        // get
        return testCases;
    }

    /**
    * Summary. Executes Rhino injection pipeline.
    * 
    * @param {any} interval The background worker holding the retry script.
    */
    function startRhino(interval) {
        try {
            // setup
            var isSite = confirmSite();

            // exit conditions
            if (!isSite) {
                return;
            }

            // interval completed
            clearInterval(interval);

            // setup - inject
            var container = getContainer();
            var testsDataFactory = () => {
                // build
                var data = {
                    testCases: getTestCases()
                };
                data["capabilities"] = {};
                data["capabilities"][C_CONNECTOR + ":options"] = getConnectorCapabilities();

                // get
                return data;
            }

            // expose on UI
            setRhino(container, () => testsDataFactory());
        } catch (e) {
            console.error('Start-Rhino = 500 internal server error')
            console.error(e);
        }
    }

    //┌─[ BACKGROUND WORKER ]───────────────────────┐
    //│                                             │
    //│ Evaluates the site every second and injects │
    //│ Rhino Widget is the site is compliant.      │
    //└─────────────────────────────────────────────┘
    //
    var interval = setInterval(() => startRhino(interval), 1000);
}

mainXrayCloud();