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

//┌─[ SETUP ]───────────────────────────────────┐
//│                                             │
//│ Set all global, static and constants.       │
//└─────────────────────────────────────────────┘
//
//-- constants (A-Z)
//
//-- C --
var C_CONNECTOR = "connector_test_rail";
var C_CONTAINER_PATH = "//div[@id='content-inner']";
//
//-- P --
var C_TEST_PATTERN = "(?<=cases/(view|edit)/)\\d+";
//
//-- S --
var C_SUITE_PATTERN = "(?<=suites/(view|edit)/)\\d+";

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
    var isTestCase = window.location.href.toLowerCase().match(C_TEST_PATTERN);
    var isTestSuite = window.location.href.toLocaleLowerCase().match(C_SUITE_PATTERN);
    var isContainer = document
        .evaluate(C_CONTAINER_PATH, document, null, XPathResult.BOOLEAN_TYPE, null)
        .booleanValue;

    // assert
    return isContainer && (isTestCase || isTestSuite);
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
    return _getConnectorCapabilities();
}

/**
* Summary. Gets the test cases (runnable entities) from the page.
*
* @returns {Array} A collection of test cases (runnable entities).
*/
function getTestCases() {
    return _getTestCases();
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
                testCases: _getTestCases()
            };
            data["capabilities"] = {};
            data["capabilities"][C_CONNECTOR + ":options"] = _getConnectorCapabilities();

            // get
            return data;
        }

        // expose on UI
        setRhino(container, () => testsDataFactory(), getTestRailHtml());
    } catch (e) {
        console.error('Start-Rhino = 500 internal server error')
        console.error(e);
    }
}

//┌─[ PRIVATE METHODS ]─────────────────────────┐
//└─────────────────────────────────────────────┘
//
// collect test cases from application DO
function _getTestCases() {
    // get test case
    var id = window.location.href.toLowerCase().match(C_TEST_PATTERN);
    id = id !== null && id.length > 0 ? "C" + id[0] : null;

    if (isNullOrEmpty(id)) {
        id = window.location.href.toLocaleLowerCase().match(C_SUITE_PATTERN)
        id = id !== null && id.length > 0 ? id[0] : null;
    }

    // setup
    var testCases = [];

    // validate
    if (isNullOrEmpty(id)) {
        return testCases;
    }

    // add to collection
    testCases.push(id);

    // get
    return testCases;
}

// collect explicit capabilities of this connector
function _getConnectorCapabilities() {
    return {}
}

//┌─[ BACKGROUND WORKER ]───────────────────────┐
//│                                             │
//│ Evaluates the site every second and injects │
//│ Rhino Widget is the site is compliant.      │
//└─────────────────────────────────────────────┘
//
var interval = setInterval(() => startRhino(interval), 1000);

//┌─[ SOFT DEPRECATED ]─────────────────────────┐
//│                                             │
//│ Functions in this area are deprecated and   │
//│ will be removed in future versions.         │
//└─────────────────────────────────────────────┘
//
/**
 * @deprecated [#1] will be replaced by a unified Rhino standard UI instead of an eplicit one.
 */
function getTestRailHtml() {
    return `        
        <div id="rh_rhino_module">
          <input type="hidden" id="rh_ui_flag" value="true" />
          <input type="hidden" id="rh_ui_data" value="false" />
          <div id="rh_rhino_module_heading" class="grid-title">
            <span class="title">Rhino Automation</span>
          </div>
          <div class="io-container io-framed form-group">
            <table>
              <tbody>
                <tr>
                  <td style="width: 20%; padding: 10px;">
                    <label title="Browser or platform on which this test or set will run." class="io-label" for="rh_web_driver">Browser (Platform)</label>
                    <select id="rh_web_driver" class="form-control form-control-full form-select searchable  chzn-done">
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
                  <td style="width: 35%; padding: 10px;">
                    <label title="Web Driver location. Can be a local folder, Grid endpoint or 3rd party Grid endpoint." class="io-label" for="rh_grid_endpoint">Driver Endpoint</label>
                    <input class="form-control form-control-full" style="height:24px;padding:0px 3px 0px 3px;" type="text" id="rh_grid_endpoint" maxlength="250" />
                  </td>
                  <td style="width: 15%; padding: 10px;">
                    <label title="The maximum number of tests that will be executed in parallel." class="io-label" for="rh_max_parallel">Max Parallel Execution</label>
                    <input class="form-control form-control-full" style="height:24px;padding:0px 3px 0px 3px;" type="number" id="rh_max_parallel" value="1" maxlength="250" />
                  </td>
                  <td style="width: 20%; padding: 10px; text-align: center;">
                    <label title="If checked, Test Plan will be created for this run." class="io-label" for="rh_create_execution">Create Plan</label>
                    <input class="form-control form-control-full" style="height:24px;padding:0px 3px 0px 3px;" type="checkbox" id="rh_create_execution"/>
                  </td>
                  <td style="width: 20%; padding: 10px; text-align: center;">
                    <label title="If checked, Bug issue will be created for each failed test or - if already opened and test passed - Bug issue will be closed." class="io-label" for="rh_open_close_bugs">Open/Close Bugs</label>
                    <input class="form-control form-control-full" style="height:24px;padding:0px 3px 0px 3px;" type="checkbox" id="rh_open_close_bugs"/>
                  </td>
                </tr>
                <tr>
                  <td colspan="5">
                    <table style="width: 100%;">
                      <tbody>
                        <tr>
                          <td style="padding: 10px;">
                            <label title="The capabilities of the selected platform as supported by the respective vendor." class="io-label" for="rh_driver_capabilities">Driver Capabilities</label>
                            <textarea class="custom form-control form-control-full" id="rh_driver_capabilities" rows="7" style="font-family: monospace;padding:0px 3px 0px 3px;"></textarea>
                          </td>
                          <td style="padding: 10px;">
                            <label title="The options of the selected platform as supported by the respective vendor." class="io-label" for="rh_driver_options">Driver Options</label>
                            <textarea class="custom form-control form-control-full" id="rh_driver_options" rows="7" style="font-family: monospace;padding:0px 3px 0px 3px;"></textarea>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td colspan="5">
                    <table>
                      <tbody>
                        <tr>
                          <td style="padding: 10px;">
                            <button id="rh_run_automation" data-rhino="false">Run Automation</button>
                          </td>
                          <td style="padding: 10px;">
                            <button id="rh_reload_tests" data-rhino="false">Reload Test Cases</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> `
}