// Gurock ON PREM INTEGRATION
function containerGurockCloud() {
    // setup
    var path = "//div[@id='content-inner']";

    // get
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// TODO: unify with other integrations and pass arguments
function injectorGurockCloud() {
    var HTML = `        
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
                      <option value="AndroidDriver">Android (Chrome or Native)</option>
                      <option value="EdgeDriver">Chromium Edge</option>
                      <option value="IEDriverServer">Internet Explorer</option>
                      <option value="iOSDriver">iOS (Safari or Native)</option>
                      <option value="ChromeDriver">Google Chrome</option>
                      <option value="FirefoxDriver">Mozilla Firefox</option>
                      <option value="SafariDriver">Safari (MAC OS)</option>
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
        </div>
    `

    // get & setup
    var node = HtmlToDom(HTML);

    // inject
    var container = containerGurockCloud();
    if (container === null) {
        return;
    }
    container.insertAdjacentElement('afterbegin', node);
    document.getElementById('rh_reload_tests').addEventListener('click', collectorGurockCloud, false);

    // collect
    collectorGurockCloud()
}

function collectorGurockCloud() {
    // get test case
    var id = "C" + window.location.href.toLowerCase().match("(?<=cases/(view|edit)/)\\d+")[0];

    // setup
    var testCases = [];

    // validate
    if (typeof (id) === "undefined" || id === null) {
        return testCases;
    }

    // add to collection
    testCases.push(id);

    // save
    chrome.storage.sync.set({ tests_repository: testCases }, () => {
        console.log("Rhino: Test entity loaded.");
    });
}

function validatorGurockCloud(integrationObject) {
    // setup conditions
    var isPath = document
        .evaluate(integrationObject.path, document, null, XPathResult.BOOLEAN_TYPE, null)
        .booleanValue;
    var isUrl = window.location.href.toLowerCase().match('cases/(view|edit)/\\d+')

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
function getGurockCloud() {
    // exit conditions
    var container = containerGurockCloud();

    if (typeof (container) === "undefined" || container === null) {
        return null;
    }

    var onPath =
        "(//span[.='Steps'] and //th[.='Step'] and //th[.='Expected Result']) or " +
        "(//div[contains(@class,'page_title') and contains(.,'Test Cases')])";

    // setup
    var gurockCloud = {
        path: onPath,
        injector: injectorGurockCloud,
        connector: "connector_test_rail",
        collector: collectorGurockCloud,
        container: container
    }
    gurockCloud["validator"] = validatorGurockCloud(gurockCloud);

    // get
    return gurockCloud;
}