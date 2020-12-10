function containerAzure() {
    // setup
    var path =
        "//div[@class='content-section']//div[@class='hub-content']|" +
        "//div[@data-renderedregion='content' and @role='main']";

    // get
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// TODO: unify with other integrations and pass arguments
function injectorAzure() {
    var HTML = `        
        <div id="rh_rhino_module" style="margin: 15px;">
            <input type="hidden" id="rh_ui_flag" value="true" />
            <input type="hidden" id="rh_ui_data" value="false" />
            <div id="rh_rhino_module_heading">
                <h2>Rhino Automation</h2>
            </div>

            <table style="width: auto;" cellpadding="5" cellspacing="5">
                <tr>
                    <td>
                        <strong title="Browser or platform on which this test or set will run.">Browser (Platform):</strong>
                    </td>
                    <td>
                        <select id="rh_web_driver" style="width: 100%">
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
                    <td colspan="2">
                        <table>
                            <tr>
                                <td><input id="rh_create_execution" type="checkbox" style="margin-left: 5px;" /></td>
                                <td><strong title="If checked, Test Execution issue will be created for this run.">Create Execution:</strong></td>                                
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong title="Web Driver location. Can be a local folder, Grid endpoint or 3rd party Grid endpoint.">Driver Endpoint:</strong>
                    </td>
                    <td>
                        <input id="rh_grid_endpoint" type="text" style="width: 100%" />
                    </td>
                    <td colspan="2">
                        <table>
                            <tr>
                                <td><input id="rh_open_close_bugs" type="checkbox" style="margin-left: 5px;" /></td>
                                <td><strong title="If checked, Bug issue will be created for each failed test or - if already opened and test passed - Bug issue will be closed.">Open/Close Bugs:</strong></td>                                
                            </tr>
                        </table>                                               
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong title="The maximum number of tests that will be executed in parallel.">Max Parallel Execution:</strong>
                    </td>
                    <td>
                        <input id="rh_max_parallel" value="1" type="number" style="width: 100%" />
                    </td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>
                        <strong title="The capabilities of the selected platform as supported by the respective vendor.">Driver Capabilities:</strong>
                    </td>
                    <td colspan="3">
                        <textarea id="rh_driver_capabilities" style="width: 100%; min-height: 130px; font-family: monospace;"></textarea>
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong title="The options of the selected platform as supported by the respective vendor.">Driver Options:</strong>
                    </td>
                    <td colspan="3">
                        <textarea id="rh_driver_options" style="width: 100%; min-height: 130px; font-family: monospace;"></textarea>
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td colspan="3">
                        <button id="rh_run_automation" data-rhino="false" style="margin-right: 5px;">Run Automation</button>
                        <button id="rh_reload_tests" data-rhino="false">Reload Test Cases</button>
                    </td>
                </tr>
            </table>
        </div>
    `

    // get & setup
    var node = HtmlToDom(HTML);

    // inject
    var container = containerAzure();
    if (container === null) {
        return;
    }
    container.insertAdjacentElement('afterbegin', node);
    document.getElementById('rh_reload_tests').addEventListener('click', collectorAzure, false);

    // collect
    collectorAzure()
}

function collectorAzure() {
    // get test cases
    var index = idColumnPosition();
    var testCases = getTestCases(index);

    // save
    chrome.storage.sync.set({ tests_repository: testCases }, () => {
        console.log("Rhino: Test entity loaded.");

        chrome.storage.sync.set({ integration_capabilities: getCapabilities() }, () => {
            console.log("Rhino: Integration capabilities loaded.");
        });
    });
}

function getFromUrl(regularExpression) {
    // get test plan
    var entity = window.location.href.toLowerCase().match(regularExpression);

    // get
    if (typeof (entity) !== "undefined" && entity !== null && entity !== "" && entity.length > 0) {
        return entity[0];
    }
    return "-1";
}

function idColumnPosition() {
    // get test case id column index
    var columnsPath =
        "//div[contains(@class,'grid-row-current') and contains(@id,'row_vss')]/ancestor::div[contains(@id,'vss')]/div[@class='grid-header']//div[@aria-label]" + "|" +
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

function getTestCases(idColumnPosition) {
    // setup
    var idPath =
        "//div[contains(@class,'grid-row-selected') and contains(@id,'row_vss')]/div[" + idColumnPosition + "]" + "|" +
        "//div[@class='test-plan-author-tab']//tr[contains(@class,'selected')]/td[" + idColumnPosition + "]";
    elements = document.evaluate(idPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    // build
    var testCases = [];
    for (var i = 0; i < elements.snapshotLength; i++) {
        testCases.push(elements.snapshotItem(i).innerText);
    }

    // get
    return testCases;
}

function getCapabilities() {
    return {
        testPlan: parseInt(getFromUrl("(?<=planid=)\\d+")),
        testSuite: parseInt(getFromUrl("(?<=suiteid=)\\d+"))
    }
}

function validatorAzure(integrationObject) {
    // setup conditions
    var isPath = document
        .evaluate(integrationObject.path, document, null, XPathResult.BOOLEAN_TYPE, null)
        .booleanValue;

    // get test plan
    var testPlan = window.location.href.toLowerCase().match("(?<=planid=)\\d+");
    var isTestPlan = typeof (testPlan) !== "undefined" && testPlan !== null && testPlan !== ""

    // get test suite
    var testSuite = window.location.href.toLowerCase().match("(?<=suiteid=)\\d+");
    var isTestSuite = typeof (testSuite) !== "undefined" && testSuite !== null && testSuite !== ""

    // assert
    return isPath && isTestPlan && isTestSuite;
}

// TODO: change validator to boolean method
/**
 * Summary. Get an HTML which will be injected into the integrated application
 *
 * @param   {any} settings Last settings saved by the user
 *
 * @returns {any}          Ready to be injected HTML
 */
function getAzure() {
    // exit conditions
    var container = containerAzure();

    if (typeof (container) === "undefined" || container === null) {
        return null;
    }

    var onPath =
        "//ul[./li[.='Tests'] and ./li['Charts']] or " +
        "(//span[@data-content='Define']|//span[@data-content='Execute']|//span[@data-content='Chart'])";

    // setup
    var azure = {
        path: onPath,
        injector: injectorAzure,
        connector: "connector_azure",
        collector: collectorAzure,
        container: container        
    }
    azure["validator"] = validatorAzure(azure);
    azure["capabilities"] = getCapabilities();

    // get
    return azure;
}