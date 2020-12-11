// XRAY ON PREM INTEGRATION
function containerXrayOnPrem() {
    return document.querySelector("div.aui-item.issue-main-column");
}

// TODO: unify with other integrations and pass arguments
function injectorXrayOnPrem() {
    var HTML = `        
        <div id="rh_rhino_module" class="module toggle-wrap collapsed">
        <input type="hidden" id="rh_ui_flag" value="true" />
        <input type="hidden" id="rh_ui_data" value="false" />
            <div id="rh_rhino_module_heading" class="mod-header">
                <ul class="ops"></ul>
                <button class="aui-button toggle-title" aria-label="Rhino Automation" aria-controls="rh_rhino_module" aria-expanded="false" resolved="">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
                        <g fill="none" fill-rule="evenodd">
                            <path d="M3.29175 4.793c-.389.392-.389 1.027 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955c.388-.392.388-1.027 0-1.419-.389-.392-1.018-.392-1.406 0l-2.298 2.317-2.307-2.327c-.194-.195-.449-.293-.703-.293-.255 0-.51.098-.703.293z" fill="#344563"></path>
                        </g>
                    </svg>
                </button>
                <h4 class="toggle-title">Rhino Automation</h4>
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
    var container = containerXrayOnPrem();
    if (container === null) {
        return;
    }
    container.insertAdjacentElement('afterbegin', node);
    document.getElementById('rh_reload_tests').addEventListener('click', collectorXrayOnPrem, false);

    // collect
    collectorXrayOnPrem()
}

function collectorXrayOnPrem() {
    // extract issue id
    var id = document.title.match("(?<=\\[).*?(?=])");

    // setup
    var testCases = [];

    // validate
    if (id.length === 0) {
        return testCases;
    }

    // add to collection
    testCases.push(id[0]);

    // save
    chrome.storage.sync.set({ tests_repository: testCases }, () => {
        console.log("Rhino: Test entity loaded.");
    });
}

function validatorXrayOnPrem(integrationObject) {
    // setup conditions
    var isPath = document
        .evaluate(integrationObject.path, document, null, XPathResult.BOOLEAN_TYPE, null)
        .booleanValue;
    var isUrl = !window.location.href.includes("atlassian.net")

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
function getXRayOnPrem() {
    // exit conditions
    var container = containerXrayOnPrem();

    if (typeof (container) === "undefined" || container === null) {
        return null;
    }

    // setup
    var xrayOnPrem = {
        path: "(//li[.//strong[.='Type:'] and .//span[contains(.,'Test') or contains(.,'Test Set')]] and (//*[.='Test Details'] or //*[.='Tests']))",
        injector: injectorXrayOnPrem,
        connector: "connector_xray",
        collector: collectorXrayOnPrem,
        container: container
    }
    xrayOnPrem["validator"] = validatorXrayOnPrem(xrayOnPrem);

    // get
    return xrayOnPrem;
}