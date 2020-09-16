// https://developer.mozilla.org/en-US/docs/Web/XPath/Introduction_to_using_XPath_in_JavaScript
// https://developer.mozilla.org/en-US/docs/Web/API/XPathResult

/**
 * Summary. Entry point for this injected scripts pipeline
 */
function main() {
    // setup
    var data = {
        endpoint: null,
        settings: null
    };

    // try to load current
    chrome.storage.sync.get(['last_endpoint'], function (endpoint) {
        data.endpoint = endpoint
        chrome.storage.sync.get(['widget_settings'], function (settings) {
            data.settings = settings;
            waitAndInject("div.aui-item.issue-main-column", data)
        });
    });
}

/**
 * Summary. Gets the relevant integration for the page on which this script is running
 * 
 * @returns {any} Integration name
 */
function getKnownIntegration() {
    // static integrations collection
    var knownIntegrations = [
        {
            path: "(//li[.//strong[.='Type:'] and .//span[contains(.,'Test') or contains(.,'Test Set')]] and (//*[.='Test Details'] or //*[.='Tests']))",
            injector: injectorXRayOnPrem,
            connector: "connector_xray"
        }
    ]

    // iterate
    for (var i = 0; i < knownIntegrations.length; i++) {
        var isKnown = isKnownIntegration(knownIntegrations[i].path);

        if (isKnown) {
            return knownIntegrations[i];
        }
    }

    // default
    return "-1";
}

/**
 * Summary. Evaluates if the given XPath finds the integrated elements
 *
 * @param {any} xpath XPath by which to evaluate integration
 * 
 * @returns {any}     true if integrated, false if not
 */
function isKnownIntegration(xpath) {
    return document
        .evaluate(xpath, document, null, XPathResult.BOOLEAN_TYPE, null)
        .booleanValue;
}

/**
 * Summary. Get an HTML which will be injected into the integrated application
 *
 * @param   {any} settings Last settings saved by the user
 *
 * @returns {any}          Ready to be injected HTML
 */
function injectorXRayOnPrem() {
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
                                    <option value="AndroidDriver">Android (Chrome or Native)</option>
                                    <option value="EdgeDriver">Chromium Edge</option>
                                    <option value="IEDriverServer">Internet Explorer</option>
                                    <option value="IosDriver">iOS (Safari or Native)</option>
                                    <option value="ChromeDriver">Google Chrome</option>
                                    <option value="FirefoxDriver">Mozilla Firefox</option>
                                    <option value="SafariDriver">Safari (MAC OS)</option>
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
    var node = HtmlToDom(HTML);

    // inject
    var container = document.querySelector("div.aui-item.issue-main-column");
    container.insertAdjacentElement('afterbegin', node);
    document.getElementById('rh_reload_tests').addEventListener('click', collectXrayTestCases, false);

    // collect
    collectXrayTestCases()
}

function collectXrayTestCases() {
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


// INJECTOR UTILITIES
function HtmlToDom(html) {
    // set container
    var container = document.createElement('div');
    container.innerHTML = html;

    // return first child as DOM element
    return container;
}

function setConfiguration(integration) {
    var integration_configuration = {
        name: "Rhino Automation",
        testsRepository: [],
        driverParameters: [
            {
                driver: "",
                driverBinaries: "",
                capabilities: {},
                options: {}
            }
        ],
        connector: integration.connector,
        authentication: {
            password: "",
            userName: ""
        },
        engineConfiguration: {
            maxParallel: 5,
            elementSearchingTimeout: 15000,
            pageLoadTimeout: 60000,
            retrunExceptions: true,
            returnPerformancePoints: true,
            returnEnvironment: true,
            terminateOnAssertFailure: false
        },
        screenshotsConfiguration: {
            "keepOriginal": false,
            "returnScreenshots": true,
            "onExceptionOnly": false
        },
        reportConfiguration: {
            localReport: false,
            addGravityData: false
        },
        providerConfiguration: {
            collection: "",
            password: "",
            user: "",
            project: "",
            bugManager: false,
            capabilities: {
                bucketSize: 15,
                dryRun: true
            }
        }
    }

    chrome.storage.sync.get(['widget_settings'], function (result) {
        if (typeof (result.widget_settings) === 'undefined') {
            console.info("Rhino: No settings were saved for this setup. Please save settings under Rhino Widget.");
            return;
        }

        // apply settings: credentials
        integration_configuration.authentication.userName = result.widget_settings.rhino_options.rhino_user_name;
        integration_configuration.authentication.password = result.widget_settings.rhino_options.rhino_password;

        // apply settings: automation provider
        integration_configuration.providerConfiguration.collection = result.widget_settings.connector_options.server_address;
        integration_configuration.providerConfiguration.user = result.widget_settings.connector_options.user_name;
        integration_configuration.providerConfiguration.password = result.widget_settings.connector_options.password;
        integration_configuration.providerConfiguration.project = result.widget_settings.connector_options.project;

        chrome.storage.sync.set({ i_c: integration_configuration }, function (result) {
            console.log("Rhino: Integration configuration " + result + " saved.")
        });
    });
}

function waitAndInject(containerSelector, settings) {
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (!mutation.addedNodes) {
                return
            }

            for (var i = 0; i < mutation.addedNodes.length; i++) {
                var isFlag = document.getElementById("rh_ui_flag") !== null;
                var isContainer = document.querySelector(containerSelector) !== null;

                if (isContainer && !isFlag) {
                    var integration = getKnownIntegration();
                    var isKnown = integration !== "-1";
                    if (!isKnown) {
                        continue;
                    }
                    integration.injector();
                    setConfiguration(integration);
                    return;
                }
            }
        })
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    })
}

main();