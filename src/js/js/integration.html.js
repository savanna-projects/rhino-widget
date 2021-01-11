//┌─[ UTILITIES ]───────────────────────────────┐
//│                                             │
//│ General purposes functions and helpers.     │
//└─────────────────────────────────────────────┘
//
/**
 * Summary: Gets the HTML for injecting Rhino Widget.
 *
 * @returns {string} Rhino Widget HTML.
 */
function getRhinoWidgetHtml() {
    return `<div id="rh_rhino_module" style="margin: 15px; min-width: 50%; max-width: 100%;">
    <style type="text/css" id="ratio.css" scoped>
        :root{
            --ratio: 0.75;
        }
    </style>

    <style type="text/css" id="grid.css" scoped>
        /*┌─[ SITE.CSS ]────────────────────────────────┐
          │                                             │
          │ Responsible layout and responsiveness.      │
          │ https://grid.layoutit.com/                  │
          └─────────────────────────────────────────────┘*/
        .rhino-grid-container,
        .rhino-grid-container-body,
        .rhino-grid-container-2-5,
        .rhino-grid-container-2-1
        .rhino-grid-container-3-1,
        .rhino-grid-container-1-1,
        .rhino-grid-container-1-15 {
            user-select: none;
            font-family: Tahoma, sans-serif;
            margin: calc(1em * var(--ratio));
            padding: 0px;
        }

        .rhino-grid-container {
            width: 100%;
            display: table-cell;
            border: solid 1px #111;
            border-top: 0;
            grid-template-columns: auto;
            grid-template-rows: repeat(3, auto);
            grid-template-areas: "." "." ".";
        }

        .rhino-grid-container-body {
            display: grid;
            grid-template-columns: repeat(2, auto);
            grid-template-rows: repeat(3, auto);
            grid-template-areas: ". ." ". ." ". .";
        }

        .rhino-grid-container-2-5 {
            display: grid;
            grid-gap: 5px 0;
            grid-template-columns: max-content auto;
            grid-template-rows: repeat(5, auto);
            grid-template-areas: ". ." ". ." ". ." ". ." ". .";
        }

        .rhino-grid-container-1-15 {
            display: grid;
            grid-gap: 5px 0;
            grid-template-columns: max-content;
            grid-template-rows: repeat(15, auto);
            grid-template-areas: "." "." "." "." "." "." "." "." "." "." "." "." "." "." ".";
        }

        .rhino-grid-container-2-1 {
            display: grid;
            grid-template-columns: repeat(2, max-content);
            grid-template-rows: repeat(1, auto);
            grid-template-areas: ". .";
        }

        .rhino-grid-container-3-1 {
            display: grid;
            grid-template-columns: repeat(3, max-content);
            grid-template-rows: repeat(1, auto);
            grid-template-areas: ". .";
        }

        .rhino-grid-container-1-1 {
            display: grid;
            grid-template-columns: repeat(1, max-content);
            grid-template-rows: repeat(1, auto);
            grid-template-areas: ".";
        }

        .rhino-middleable {
            display: table;
            height: 100%
        }

        .middleable .middle {
            display: table-cell;
            vertical-align: middle;
        }

        .rhino-mr-5 {
            margin-right: calc(0.5em * var(--ratio));
        }

        .rhino-mr-10 {
            margin-right: calc(1em * var(--ratio));
        }

        .rhino-mr-15 {
            margin-right: calc(1.5em * var(--ratio));
        }

        .rhino-ml-0 {
            margin-left: 0;
        }

        .rhino-ml-10 {
            margin-left: calc(1em * var(--ratio));
        }

        .rhino-ml-15 {
            margin-left: calc(1.5em * var(--ratio));
        }

        .rhino-mt-0 {
            margin-top: 0;;
        }

        .rhino-mt-5 {
            margin-top: calc(0.5em * var(--ratio));
        }

        .rhino-mt-15 {
            margin-top: calc(1.5em * var(--ratio));
        }

        .rhino-mb-10 {
            margin-bottom: calc(1em * var(--ratio));
        }

        .rhino-mb-0 {
            margin-bottom: 0;
        }

        .rhino-mb-15 {
            margin-bottom: calc(1.5em * var(--ratio));
        }

        .rhino-pl-15 {
            padding-left: calc(1.5em * var(--ratio));
        }

        .rhino-pt-15 {
            padding-top: calc(1.5em * var(--ratio));
        }

        .rhino-m-15 {
            margin: calc(1.5em * var(--ratio));
        }

        .rhino-p-15 {
            padding: calc(1.5em * var(--ratio));
        }
    </style>

    <style id="site.css" type="text/css" scoped>
        /*┌─[ PARAMETERS ]──────────────────────────────┐
          └─────────────────────────────────────────────┘*/
        :root {
            --background-black: #2a2a2a;
            --background-input: #f6f7f8;
            --black: #000;
            --border-input: #ececec;
            --border-panel: #eee;
            --primary-black: #111;
            --primary-red: #d21e2b;
            --white: #fff;
        }

        /*┌─[ SITE.CSS ]────────────────────────────────┐
          │                                             │
          │ Responsible for colors and themes.          │
          └─────────────────────────────────────────────┘*/
        .rhino-body {
            background: var(--white);
        }

        .rhino-top-bar {
            -webkit-tap-highlight-color: rgba(0,0,0,0);
            font-size: calc(1em * var(--ratio));
            color: var(--white);
            box-sizing: border-box;
            user-select: none;
            display: block;
            padding: calc(0.5em * var(--ratio));
            padding-left: 0;
            padding-right: 0;
            position: relative;
            background: var(--background-black);
        }

            .rhino-top-bar a {
                color: var(--white);
                text-decoration: none;
            }

                .rhino-top-bar a:hover {
                    text-decoration: underline;
                }

        .rhino-top-panel {
            font-family: Tahoma, sans-serif;
            box-sizing: border-box;
            display: block;
            position: relative;
            min-height: calc(3.5em * var(--ratio));
            background: var(--white);
            border: none;
            border-radius: 0px;
            padding: calc(1em * var(--ratio));
            margin-bottom: 0px;
            border-bottom: 1px solid var(--border-panel);
            box-shadow: 0 0 65px rgba(0,0,0,.09);
            transition-duration: 0.5s;
        }

        .rhino-primary-red {
            color: var(--primary-red);
        }

        .rhino-primary-black {
            color: var(--primary-black);
        }

        .rhino-font-700,
        .rhino-font-500,
        .rhino-font-300 {
            font-size: calc(1.4em * var(--ratio));
        }

        .rhino-font-700-s,
        .rhino-font-500-s,
        .rhino-font-300-s {
            font-size: calc(1em * var(--ratio));
        }

        .rhino-font-700,
        .rhino-font-700-s {
            font-weight: 700;
        }

        .rhino-font-500,
        .rhino-font-500-s {
            font-weight: 500;
        }

        .rhino-font-300,
        .rhino-font-300-s {
            font-weight: 300;
        }

        .rhino-select {
            box-sizing: border-box;
            margin: 0;
            text-transform: none;
            font-weight: 500 !important;
            font-size: calc(1em * var(--ratio));
            background: var(--white);
            color: var(--primary-black) !important;
            outline: none;
            width: 100%;
            padding: calc(0.8em * var(--ratio));
            transition: .3s;
            height: calc(3.5em * var(--ratio));
            border-radius: 0px;
            border: 1px solid var(--border-input);
        }

        input[type=text],
        input[type=number],
        textarea {
            box-sizing: border-box;
            margin: 0;
            max-width: 100%;
            font-weight: 500 !important;
            border-radius: 0px;
            font-size: calc(1em * var(--ratio));
            border: 1px solid var(--border-input);
            background: var(--background-input);
            color: var(--primary-black) !important;
            outline: none;
            width: 100%;
            padding: calc(0.8em * var(--ratio));
            transition-duration: 0.4s;
        }

            input[type=text]:focus,
            input[type=number]:focus,
            textarea:focus {
                background: var(--white);
            }

        input[type=text],
        input[type=number],
        textarea,
        select {
            min-width: calc(25em * var(--ratio));
        }

        textarea {
            font-family: "Courier New", Courier, monospace;
            overflow: auto;
            transition-duration: 0.4s;
            min-height: calc(6.25em * var(--ratio));
        }

        input[type=checkbox] {
            display: none;
        }

        label .rhino-checkbox {
            height: calc(1em * var(--ratio));
            width: calc(1em * var(--ratio));
            border: 1px solid var(--primary-black);
            display: inline-block;
            margin-right: calc(0.5em * var(--ratio));
        }

        [type=checkbox]:checked + span {
            background: black;
        }

        .rhino-label-checkbox {
            font-weight: 500 !important;
            font-size: calc(0.8em * var(--ratio));
            color: #111 !important;
            display: flex;
            align-items: center;
        }

        .rhino-button-dark {
            font: inherit;
            overflow: visible;
            text-transform: none;
            cursor: pointer;
            outline: 0 none;
            border: none;
            border-radius: 0px;
            background: var(--primary-black);
            color: var(--white);
            transition-duration: .3s;
            display: inline-block;
            font-size: calc(1em * var(--ratio));
            font-weight: 500;
            padding: calc(1em * var(--ratio)) calc(2em * var(--ratio)) calc(1em * var(--ratio)) calc(2em * var(--ratio));
            min-height: calc(3em * var(--ratio));
        }

            .rhino-button-dark:hover {
                background: var(--primary-red);
            }

        .rhino-monospace {
            font-family: "Courier New", Courier, monospace;
        }
    </style>
    <!-- Flags -->
    <input type="hidden" id="rh_ui_flag" value="true" />
    <input type="hidden" id="rh_ui_data" value="false" />

    <!-- Container Wrapper -->
    <div class="rhino-grid-container rhino-body">
        <!-- Header -->
        <div class="rhino-grid-template-areas rhino-top-bar">
            <div class="rhino-grid-container-3-1 rhino-ml-10 rhino-mr-10">
                <div class="rhino-grid-template-areas rhino-mr-10">
                    <a target="_blank"
                       href="https://github.com/savanna-projects"
                       style="color: var(--white);">
                        GitHub
                    </a>
                </div>
                <div class="rhino-grid-template-areas rhino-mr-10">
                    <a target="_blank"
                       href="https://hub.docker.com/r/rhinoapi/rhino-agent"
                       style="color: var(--white);">
                        DockerHub
                    </a>
                </div>
                <div class="rhino-grid-template-areas rhino-mr-10">
                    <a target="_blank"
                       href="https://github.com/savanna-projects/rhino-agent/blob/master/docs/pages/Home.md"
                       style="color: var(--white);">
                        Documentation
                    </a>
                </div>
            </div>
        </div>

        <!-- Title -->
        <div class="rhino-grid-template-areas rhino-top-panel">
            <span class="rhino-font-700 rhino-primary-black">Rhino</span><span class="rhino-font-700 rhino-primary-red">API</span><br />
            <span class="rhino-font-300-s rhino-primary-black">Automation Integrator</span>
        </div>
        <div class="rhino-grid-template-areas">
            <!-- Body Wrapper -->
            <div class="rhino-grid-container-body">
                <!-- Title -->
                <div class="rhino-grid-template-areas rhino-mb-15">
                    <span class="rhino-font-700 rhino-primary-black"
                          title="Set playback options such as browser type and driver capabilities.">
                        Playback Settings
                    </span>
                </div>
                <div class="rhino-grid-template-areas rhino-mb-15">
                    <span class="rhino-font-700 rhino-primary-black">Integration Settings</span>
                </div>
                <!-- Playback Settings Wrapper -->
                <div class="rhino-grid-container-2-5 rhino-ml-0 rhino-mt-0 rhino-mb-0">
                    <div class="rhino-grid-template-areas rhino-mr-10 rhino-middleable">
                        <span class="rhino-font-500-s rhino-middle"
                              title="Browser or platform on which this test or set will run.">
                            Browser (Platform):
                        </span>
                    </div>
                    <div class="rhino-grid-template-areas">
                        <select id="rh_web_driver" class="rhino-select">
                            <option value="AndroidDriver">AndroidDriver</option>
                            <option value="ChromeDriver">ChromeDriver</option>
                            <option value="FirefoxDriver">FirefoxDriver</option>
                            <option value="IEDriverServer">IEDriverServer</option>
                            <option value="iOSDriver">iOSDriver</option>
                            <option value="MicrosoftWebDriver">MicrosoftWebDriver</option>
                            <option value="MockWebDriver">MockWebDriver</option>
                            <option value="SafariDriver">SafariDriver</option>
                        </select>
                    </div>

                    <div class="rhino-grid-template-areas rhino-mr-10 rhino-middleable">
                        <span class="rhino-font-500-s rhino-middle"
                              title="Web Driver location. Can be a local folder, Grid endpoint or 3rd party Grid endpoint.">
                            Driver Endpoint:
                        </span>
                    </div>
                    <div class="rhino-grid-template-areas">
                        <input id="rh_grid_endpoint"
                               type="text"
                               placeholder="e.g http://localhost:4444/wd/hub"
                               style="font-family: monospace;" />
                    </div>

                    <div class="rhino-grid-template-areas rhino-mr-10 rhino-middleable">
                        <span class="rhino-font-500-s rhino-middle"
                              title="The maximum number of tests that will be executed in parallel.">
                            Max Parallel Execution:
                        </span>
                    </div>
                    <div class="rhino-grid-template-areas">
                        <input id="rh_max_parallel" value="1" type="number" min="1" />
                    </div>

                    <div class="rhino-grid-template-areas rhino-mr-10">
                        <span class="rhino-font-500-s"
                              title="The capabilities of the selected platform as supported by the respective vendor.">
                            Driver Capabilities:
                        </span>
                    </div>
                    <div class="rhino-grid-template-areas">
                        <textarea id="rh_driver_capabilities" name="Driver capabilities">{}</textarea>
                    </div>

                    <div class="rhino-grid-template-areas rhino-mr-10">
                        <span class="rhino-font-500-s"
                              title="The options of the selected platform as supported by the respective vendor.">
                            Driver Options:
                        </span>
                    </div>
                    <div class="rhino-grid-template-areas">
                        <textarea id="rh_driver_options" name="Driver Options">{}</textarea>
                    </div>
                </div>
                <!-- Integration Settings Wrapper -->
                <div class="rhino-grid-container-1-15" style="margin: 0; padding: 0;">
                    <div class="rhino-grid-template-areas rhino-mr-5">
                        <label class="rhino-font-500-s rhino-middle"
                               title="Check for creating test run reports under the integrated system (i.e. Jira, Azure DevOps, etc.)">
                            <input type="checkbox" id="rh_create_execution">
                            <span class="rhino-checkbox"></span>
                            <span class="rhino-primary-black">Create Execution</span>
                        </label>
                    </div>
                    <div class="rhino-grid-template-areas rhino-mr-5">
                        <label class="rhino-font-500-s"
                               title="Check for activating Bugs Manager for this run. Bugs Manager will open, close and update bugs during the run.">
                            <input type="checkbox" id="rh_open_close_bugs">
                            <span class="rhino-checkbox"></span>
                            <span class="rhino-primary-black">Open/Close Bugs</span>
                        </label>
                    </div>
                    <div class="rhino-grid-template-areas rhino-mr-5">
                        <label class="rhino-font-500-s"
                               title="Check for creating Rhino report in addition to any other report already generated by this run. Adding additional reporters can be done under Options page.">
                            <input type="checkbox" id="rh_create_report">
                            <span class="rhino-checkbox"></span>
                            <span class="rhino-primary-black">Create Rhino Report</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <div class="rhino-grid-template-areas rhino-ml-10 rhino-mr-10 rhino-mb-10">
            <button class="rhino-button-dark"
                    id="rh_run_automation"
                    data-rhino="false"
                    title="Run the selected tests or sets using saved options and user options.">
                Run Automation
            </button>

            <button class="rhino-button-dark"
                    id="rh_reload_tests"
                    data-rhino="false"
                    title="Reloads the selected tests into the local storage. Use to reset the current loaded tests.">
                Reload Test Cases
            </button>
        </div>
    </div>
</div>`
}

/**
 * Summary: Creates a DIV element and injected the HTML to it in order to created injected HTML.
 *
 * @param {string} html The HTML code to build by.
 * 
 * @returns {any} The element created.
 */
function htmlToDom(html) {
    // set container
    var container = document.createElement('div');
    container.innerHTML = html;

    // return first child as DOM element
    return container;
}