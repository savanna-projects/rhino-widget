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
    var HTML = getHtml();

    // get & setup
    var node = htmlToDom(HTML);

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