﻿//┌─[ INTERFACE ]───────────────────────────────┐
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
    var C_CONNECTOR = "ConnectorXrayCloud";
    var C_CONTAINER_PATH = "//div[contains(@data-test-id,'issue.views.issue-details.issue-layout.left-most-column')]";
    var C_ENTITIES_PATH =
        "//div[contains(@data-test-id,'current-issue-container') and (.//button[contains(@aria-label,'Test Set') or contains(@aria-label,'Test Paln') or contains(@aria-label,'Test') or contains(@aria-label,'Test Execution')])]//a/span/span|" +
        "//div[contains(@data-test-id,'current-issue-container') and (.//button[contains(@aria-label,'Test Set') or contains(@aria-label,'Test Paln') or contains(@aria-label,'Test') or contains(@aria-label,'Test Execution')])]//a/span";

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
            .evaluate(C_ENTITIES_PATH, document, null, XPathResult.BOOLEAN_TYPE, null)
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
        var path = C_ENTITIES_PATH;
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
    function startRhino() {
        // setup
        var serviceBuilder = new RhinoServiceBuilder();

        // build
        serviceBuilder
            .setConnector(C_CONNECTOR)
            .setHtml(getRhinoWidgetHtml(0.85))
            .setConfirmSiteCondition(confirmSite)
            .setConnectorCapabilitiesFactory(getConnectorCapabilities)
            .setContainerFactory(getContainer)
            .setTestsFactory(getTestCases)
            .setExistsCondition(isRhinoExists)
            .setInjectMethod(setRhino)
            .setPersistent(true)
            .start(interval);
    }

    //┌─[ BACKGROUND WORKER ]───────────────────────┐
    //│                                             │
    //│ Evaluates the site every second and injects │
    //│ Rhino Widget is the site is compliant.      │
    //└─────────────────────────────────────────────┘
    var interval = setInterval(() => startRhino(), getIntervalTime());
}

mainXrayCloud();