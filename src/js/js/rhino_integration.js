// https://developer.mozilla.org/en-US/docs/Web/XPath/Introduction_to_using_XPath_in_JavaScript
// https://developer.mozilla.org/en-US/docs/Web/API/XPathResult

/**
 * Summary. Entry point for this injected scripts pipeline
 */
function main() {
    // inject XRay
    waitAndInject("div.aui-item.issue-main-column", null);

    // setup conditions
    console.log('Rhino X-Ray Integration.');
    
}

/**
 * Summary. Gets the relevant integration for the page on which this script is running
 * 
 * @returns {any} Integration name
 */
function getKnownIntegration() {
    // static integrations collection
    var knownIntegrations = {
        jiraXRay: "(//li[.//strong[.='Type:'] and .//span[contains(.,'Test') or contains(.,'Test Set')]] and (//*[.='Test Details'] or //*[.='Tests']))"
    }

    // iterate
    for (var key in knownIntegrations) {
        console.log("iteration");
        var isKnown = isKnownIntegration(knownIntegrations[key]);

        if (isKnown) {
            return key.toString();
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
 * Summary. Get the last settings saved by the user
 *
 * @returns {any} Last settings saved by the user
 */
function getSettings() {
    // setup
    var data = {};

    // try to load current
    chrome.storage.sync.get(['last_endpoint'], function (result) {
        data.endpoint = result
        chrome.storage.sync.get(['widget_settings'], function (result) {
            data.settings = result;
        });
    });

    // get settings
    return data;
}

/**
 * Summary. Get an HTML which will be injected into the integrated application
 *
 * @param {any} widgetSettings Last settings saved by the user
 *
 * @returns {any}              Ready to be injected HTML
 */
function injectJiraXRay(widgetSettings) {
    var HTML = `        
        <div id="rh_rhino_module" class="module toggle-wrap collapsed">
        <input type="hidden" id="rh_ui_flag" value="injected" />
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

                  <li class="item full-width">
                      <div class="wrap">
                          <strong class="name" title="The capabilities of the selected platform as supported by the respective vendor.">Driver Capabilities:</strong>
                          <span class="value" style="width: 100%">
                              <textarea class="aui-button" id="rh_capabilities" style="width: 100%; min-height: 130px;"></textarea>
                          </span>
                      </div>
                  </li>

                  <li class="item full-width">
                      <div class="wrap">
                          <span class="value">
                              <button class="aui-button aui-button-primary" id="rh_run_automation" data-rhino="false">Run Automation</textarea>
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
}

function HtmlToDom(html) {
    // set container
    var container = document.createElement('div');
    container.innerHTML = html;

    // return first child as DOM element
    return container;
}

// TODO: allow to pass injection method
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
                    var isKnown = getKnownIntegration() !== "-1";
                    if (!isKnown) {
                        continue;
                    }
                    injectJiraXRay(settings);
                    return;
                }
            }
        })
    });
    observer.observe(document.body, {
        childList: true,
        subtree: false,
        attributes: false,
        characterData: false
    })
}

main();