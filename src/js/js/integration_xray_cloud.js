// XRAY ON PREM INTEGRATION
function containerXrayCloud() {
    // setup
    var path = "//div[contains(@data-test-id,'issue.views.issue-details.issue-layout.left-most-column')]";

    // get
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// TODO: unify with other integrations and pass arguments
function injectorXrayCloud() {
    var HTML = `        
        <div id="rh_rhino_module">
        <input type="hidden" id="rh_ui_flag" value="true" />
        <input type="hidden" id="rh_ui_data" value="false" />
            <div id="rh_rhino_module_heading" class="mod-header">
                <ul class="ops"></ul>
                <h5 class="toggle-title">Rhino Automation</h5>
            </div>
            <div class="mod-content">
                <ul class="property-list two-cols">             
                    <li class="item">
                        <div class="wrap">
                            <strong class="name" title="Browser or platform on which this test or set will run.">Browser (Platform):</strong>
                            <span class="value" style="width: 95%">
                                <select id="rh_web_driver" class="aui-button" style="width: 100%">
                                    <option value="AndroidDriver">AndroidDriver</option>
                                    <option value="ChromeDriver">ChromeDriver</option>
                                    <option value="FirefoxDriver">FirefoxDriver</option>
                                    <option value="IEDriverServer">IEDriverServer</option>
                                    <option value="iOSDriver">iOSDriver</option>
                                    <option value="MicrosoftWebDriver">MicrosoftWebDriver</option>
                                    <option value="MockWebDriver">MockWebDriver</option>
                                    <option value="SafariDriver">SafariDriver</option>
                                </select>
                            </span>
                        </div>
                    </li>
            
                   <li class="item item-right">
                       <div class="wrap">
                           <strong class="name" title="If checked, Test Execution issue will be created for this run.">Create Execution:</strong>
                           <span class="value">
                               <input id="rh_create_execution" type="checkbox"/>
                           </span>
                       </div>
                   </li>
    
                   <li class="item new">
                       <div class="wrap">
                           <strong class="name" title="Web Driver location. Can be a local folder, Grid endpoint or 3rd party Grid endpoint.">Driver Endpoint:</strong>
                           <span class="value" style="width: 95%">
                               <input id="rh_grid_endpoint" type="text" class="aui-button" style="width: 100%"/>
                           </span>
                       </div>
                   </li>

                   <li class="item item-right">
                       <div class="wrap">
                           <strong class="name" title="If checked, Bug issue will be created for each failed test or - if already opened and test passed - Bug issue will be closed.">Open/Close Bugs:</strong>
                           <span class="value">
                               <input id="rh_open_close_bugs" type="checkbox"/>
                           </span>
                       </div>
                   </li>

                   <li class="item new">
                       <div class="wrap">
                           <strong class="name" title="The maximum number of tests that will be executed in parallel.">Max Parallel Execution:</strong>
                           <span class="value" style="width: 95%">
                               <input id="rh_max_parallel" value="1" type="number" class="aui-button" style="width: 100%"/>
                           </span>
                       </div>
                   </li>

                  <li class="item full-width">
                      <div class="wrap">
                          <strong class="name" title="The capabilities of the selected platform as supported by the respective vendor.">Driver Capabilities:</strong>
                          <span class="value" style="width: 100%">
                              <textarea class="aui-button" id="rh_driver_capabilities" style="width: 100%; min-height: 130px; font-family: monospace;"></textarea>
                          </span>
                      </div>
                  </li>

                  <li class="item full-width">
                      <div class="wrap">
                          <strong class="name" title="The options of the selected platform as supported by the respective vendor.">Driver Options:</strong>
                          <span class="value" style="width: 100%">
                              <textarea class="aui-button" id="rh_driver_options" style="width: 100%; min-height: 130px; font-family: monospace;"></textarea>
                          </span>
                      </div>
                  </li>

                  <li class="item full-width">
                      <div class="wrap">
                          <span class="value">
                              <button class="aui-button aui-button-primary" id="rh_run_automation" data-rhino="false">Run Automation</textarea>
                          </span>
                          <span class="value">
                              <button class="aui-button aui-button-primary" id="rh_reload_tests" data-rhino="false">Reload Test Cases</textarea>
                          </span>
                      </div>
                  </li>
              </ul>
            </div>
        </div>
    `

    // get & setup
    var node = htmlToDom(HTML);

    // inject
    var container = containerXrayCloud();
    if (container === null) {
        return;
    }
    container.insertAdjacentElement('afterbegin', node);
    document.getElementById('rh_reload_tests').addEventListener('click', collectorXrayCloud, false);

    // collect
    collectorXrayCloud()
}

function collectorXrayCloud() {
    // extract issue id
    var path = "//div[contains(@data-test-id,'current-issue-container')]//a/span/span";
    var element = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    // setup
    var testCases = [];

    // validate
    if (typeof (element) === "undefined" || element === null) {
        return testCases;
    }

    // add to collection
    testCases.push(element.textContent);

    // save
    chrome.storage.sync.set({ tests_repository: testCases }, () => {
        console.log("Rhino: Test entity loaded.");
    });
}

function validatorXrayCloud(integrationObject) {
    // setup conditions
    var isPath = document
        .evaluate(integrationObject.path, document, null, XPathResult.BOOLEAN_TYPE, null)
        .booleanValue;
    var isUrl = window.location.href.includes("atlassian.net")

    // assert
    return isPath && isUrl;
}

/**
 * Summary. Get an HTML which will be injected into the integrated application
 *
 * @param   {any} settings Last settings saved by the user
 *
 * @returns {any}          Ready to be injected HTML
 */
function getXRayCloud() {
    // exit conditions
    var container = containerXrayCloud();

    if (typeof (container) === "undefined" || container === null) {
        return null;
    }

    var onPath = "(//button[contains(@aria-label, 'Test - ') " +
        "or contains(@aria-label, 'Test Set - ') " +
        "or contains(@aria-label, 'Test Plan - ') " +
        "or contains(@aria-label, 'Test Execution - ')] " +
        "and (//*[.='Test Details'] or //*[.='Tests'])) ";

    // setup
    var xrayCloud = {
        path: onPath,
        injector: injectorXrayCloud,
        connector: "connector_xray_cloud",
        collector: collectorXrayCloud,
        container: container
    }
    xrayCloud["validator"] = validatorXrayCloud(xrayCloud);

    // get
    return xrayCloud;
}