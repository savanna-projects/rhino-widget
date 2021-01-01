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

function mainAzure() {
    //┌─[ SETUP ]───────────────────────────────────┐
    //│                                             │
    //│ Set all global, static and constants.       │
    //└─────────────────────────────────────────────┘
    //
    //-- constants (A-Z)
    //
    //-- C --
    var C_CONNECTOR = "connector_azure";
    var C_CONTAINER_PATH =
        "//div[@class='content-section']//div[@class='hub-content']|" +
        "//div[@data-renderedregion='content' and @role='main']";
    //
    //-- P --
    var C_TEST_PATTERN = "(?<=planid=)\\d+";
    //
    //-- S --
    var C_SUITE_PATTERN = "(?<=suiteid=)\\d+";

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
        var isContainer = document
            .evaluate(C_CONTAINER_PATH, document, null, XPathResult.BOOLEAN_TYPE, null)
            .booleanValue;

        // get test plan
        var testPlan = window.location.href.toLowerCase().match(C_TEST_PATTERN);
        var isTestPlan = typeof (testPlan) !== "undefined" && testPlan !== null && testPlan !== ""

        // get test suite
        var testSuite = window.location.href.toLowerCase().match(C_SUITE_PATTERN);
        var isTestSuite = typeof (testSuite) !== "undefined" && testSuite !== null && testSuite !== ""

        // assert
        return isContainer && isTestPlan && isTestSuite;
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
        return {
            testPlan: parseInt(_getFromUrl(C_TEST_PATTERN)),
            testSuite: parseInt(_getFromUrl(C_SUITE_PATTERN))
        }
    }

    function _getFromUrl(regularExpression) {
        // get test plan
        var entity = window.location.href.toLowerCase().match(regularExpression);

        // get
        if (typeof (entity) !== "undefined" && entity !== null && entity !== "" && entity.length > 0) {
            return entity[0];
        }
        return "-1";
    }

    /**
    * Summary. Gets the test cases (runnable entities) from the page.
    *
    * @returns {Array} A collection of test cases (runnable entities).
    */
    function getTestCases() {
        // setup
        var idColumnPosition = _getIdColumnPosition();

        // get
        return _getTestCasesByPosition(idColumnPosition);
    }

    function _getIdColumnPosition() {
        // get test case id column index
        var columnsPath =
            "//div[contains(@class,'grid-row-current') and contains(@id,'row_vss')]/ancestor::div[contains(@id,'vss')]/div[@class='grid-header']//div[@aria-label]|" +
            "//div[@class='test-plan-author-tab']//th";
        var elements = document.evaluate(columnsPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        // find
        for (var i = 0; i < elements.snapshotLength; i++) {
            if (!elements.snapshotItem(i).innerText.match('ID|Test Case Id')) {
                continue;
            }
            return i + 1;
        }
    }

    function _getTestCasesByPosition(idColumnPosition) {
        // setup
        var idPath =
            "//div[contains(@class,'grid-row-selected') and contains(@id,'row_vss')]/div[" + idColumnPosition + "]" + "|" +
            "//div[@class='test-plan-author-tab']//tr[contains(@class,'selected')]/td[" + idColumnPosition + "]";
        var elements = document.evaluate(idPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        // build
        var testCases = [];
        for (var i = 0; i < elements.snapshotLength; i++) {
            testCases.push(elements.snapshotItem(i).innerText);
        }

        // get
        return testCases;
    }

    /**
    * Summary. Executes Rhino injection pipeline.
    * 
    * @param {any} interval The background worker holding the retry script.
    */
    function startRhino() {
        // setup
        var serviceBuilder = new RhinoServiceBuilder();

        // build
        serviceBuilder
            .setConnector(C_CONNECTOR)
            .setConfirmSiteCondition(confirmSite)
            .setConnectorCapabilitiesFactory(getConnectorCapabilities)
            .setContainerFactory(getContainer)
            .setTestsFactory(getTestCases)
            .setExistsCondition(isRhinoExists)
            .setInjectMethod(setRhino)
            .setPersistent(false)
            .start(interval);
    }

    //┌─[ BACKGROUND WORKER ]───────────────────────┐
    //│                                             │
    //│ Evaluates the site every second and injects │
    //│ Rhino Widget is the site is compliant.      │
    //└─────────────────────────────────────────────┘
    var interval = setInterval(() => startRhino(), getIntervalTime());
}

mainAzure();