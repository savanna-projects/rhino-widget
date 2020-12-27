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
    return `
<div id="rh_rhino_module" style="margin: 15px; min-width: 50%; max-width: 100%;">
    <style type="text/css" id="norm.css" scoped>
        /*┌─[ NORMALIZE.CSS ]───────────────────────────┐
          │                                             │
          │ Responsible cross browser consistency       │
          │ https://github.com/necolas/normalize.css    │
          └─────────────────────────────────────────────┘*/
        h1 {
            font-size: 2em;
            margin: 0.67em 0;
        }

        hr {
            box-sizing: content-box;
            height: 0;
            overflow: visible;
        }

        pre {
            font-family: monospace, monospace;
            font-size: 1em;
        }

        a {
            background-color: transparent;
        }

        abbr[title] {
            border-bottom: none;
            text-decoration: underline;
            text-decoration: underline dotted;
        }

        b,
        strong {
            font-weight: bolder;
        }

        code,
        kbd,
        samp {
            font-family: monospace, monospace;
            font-size: 1em;
        }

        small {
            font-size: 80%;
        }

        sub,
        sup {
            font-size: 75%;
            line-height: 0;
            position: relative;
            vertical-align: baseline;
        }

        sub {
            bottom: -0.25em;
        }

        sup {
            top: -0.5em;
        }

        img {
            border-style: none;
        }

        button,
        input,
        optgroup,
        select,
        textarea {
            font-family: inherit;
            font-size: 100%;
            line-height: 1.15;
            margin: 0;
        }

        button,
        input {
            overflow: visible;
        }

        button,
        select {
            text-transform: none;
        }

        button,
        [type="button"],
        [type="reset"],
        [type="submit"] {
            -webkit-appearance: button;
        }

            button::-moz-focus-inner,
            [type="button"]::-moz-focus-inner,
            [type="reset"]::-moz-focus-inner,
            [type="submit"]::-moz-focus-inner {
                border-style: none;
                padding: 0;
            }

            button:-moz-focusring,
            [type="button"]:-moz-focusring,
            [type="reset"]:-moz-focusring,
            [type="submit"]:-moz-focusring {
                outline: 1px dotted ButtonText;
            }

        fieldset {
            padding: 0.35em 0.75em 0.625em;
        }

        legend {
            box-sizing: border-box;
            color: inherit;
            display: table;
            max-width: 100%;
            padding: 0;
            white-space: normal;
        }

        progress {
            vertical-align: baseline;
        }

        textarea {
            overflow: auto;
        }

        [type="checkbox"],
        [type="radio"] {
            box-sizing: border-box;
            padding: 0;
        }

        [type="number"]::-webkit-inner-spin-button,
        [type="number"]::-webkit-outer-spin-button {
            height: auto;
        }

        [type="search"] {
            -webkit-appearance: textfield;
            outline-offset: -2px;
        }

            [type="search"]::-webkit-search-decoration {
                -webkit-appearance: none;
            }

        ::-webkit-file-upload-button {
            -webkit-appearance: button;
            font: inherit;
        }

        details {
            display: block;
        }

        summary {
            display: list-item;
        }

        template {
            display: none;
        }

        .hidden, [hidden] {
            display: none !important;
        }
    </style>

    <style type="text/css" id="grid.css" scoped>
        /*┌─[ SITE.CSS ]────────────────────────────────┐
          │                                             │
          │ Responsible layout and responsiveness.      │
          │ https://grid.layoutit.com/                  │
          └─────────────────────────────────────────────┘*/
        .grid-container,
        .grid-container-body,
        .grid-container-2-5,
        .grid-container-2-1
        .grid-container-3-1,
        .grid-container-1-1,
        .grid-container-1-15 {
            user-select: none;
            font-family: Tahoma, sans-serif;
            margin: 15px;
            padding: 0px;
        }

        .grid-container {
            width: 100%;
            display: table-cell;
            border: solid 1px #111;
            grid-template-columns: auto;
            grid-template-rows: repeat(3, auto);
            grid-template-areas: "." "." ".";
        }

        .grid-container-body {
            display: grid;
            grid-template-columns: repeat(2, auto);
            grid-template-rows: repeat(3, auto);
            grid-template-areas: ". ." ". ." ". .";
        }

        .grid-container-2-5 {
            display: grid;
            grid-gap: 5px 0;
            grid-template-columns: max-content auto;
            grid-template-rows: repeat(5, auto);
            grid-template-areas: ". ." ". ." ". ." ". ." ". .";
        }

        .grid-container-1-15 {
            display: grid;
            grid-gap: 5px 0;
            grid-template-columns: max-content;
            grid-template-rows: repeat(15, auto);
            grid-template-areas: "." "." "." "." "." "." "." "." "." "." "." "." "." "." ".";
        }

        .grid-container-2-1 {
            display: grid;
            grid-template-columns: repeat(2, max-content);
            grid-template-rows: repeat(1, auto);
            grid-template-areas: ". .";
        }

        .grid-container-3-1 {
            display: grid;
            grid-template-columns: repeat(3, max-content);
            grid-template-rows: repeat(1, auto);
            grid-template-areas: ". .";
        }

        .grid-container-1-1 {
            display: grid;
            grid-template-columns: repeat(1, max-content);
            grid-template-rows: repeat(1, auto);
            grid-template-areas: ".";
        }

        .middleable {
            display: table;
            height: 100%
        }

            .middleable .middle {
                display: table-cell;
                vertical-align: middle;
            }

        .mr-5 {
            margin-right: 5px;
        }

        .mr-10 {
            margin-right: 10px;
        }

        .mr-15 {
            margin-right: 15px;
        }

        .ml-15 {
            margin-left: 15px;
        }

        .mt-5 {
            margin-top: 15px;
        }

        .mt-15 {
            margin-top: 15px;
        }

        .mb-15 {
            margin-bottom: 15px;
        }

        .pl-15 {
            padding-left: 15px;
        }

        .pt-15 {
            padding-top: 15px;
        }

        .m-15 {
            margin: 15px;
        }

        .p-15 {
            padding: 15px;
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
        .top-bar {
            -webkit-tap-highlight-color: rgba(0,0,0,0);
            font-size: 14px;
            color: var(--white);
            box-sizing: border-box;
            user-select: none;
            display: block;
            position: relative;
            background: var(--background-black);
            height: 45px;
        }

            .top-bar a {
                color: var(--white);
                text-decoration: none;
            }

                .top-bar a:hover {
                    text-decoration: underline;
                }

        .top-panel {
            font-family: Tahoma, sans-serif;
            box-sizing: border-box;
            display: block;
            position: relative;
            min-height: 50px;
            background: var(--white);
            border: none;
            border-radius: 0px;
            padding: 0px 0px 0px 0px;
            margin-bottom: 0px;
            border-bottom: 1px solid var(--border-panel);
            box-shadow: 0 0 65px rgba(0,0,0,.09);
            transition-duration: 0.5s;
        }

        .primary-red {
            color: var(--primary-red);
        }

        .primary-black {
            color: var(--primary-black);
        }

        .font-700 {
            font-size: 30px;
        }

        .font-700-s {
            font-size: 24px;
        }

        .font-700,
        .font-700-s {
            font-weight: 700;
        }

        .font-500 {
            font-size: 20px;
        }

        .font-500-s {
            font-size: 15px;
        }

        .font-500,
        .font-500-s {
            font-weight: 500;
        }

        .font-300 {
            font-size: 20px;
        }

        .font-300-s {
            font-size: 15px;
        }

        .font-300,
        .font-300-s {
            font-weight: 300;
        }

        select {
            box-sizing: border-box;
            margin: 0;
            text-transform: none;
            font-weight: 500 !important;
            font-size: 15px;
            background: var(--white);
            color: var(--primary-black) !important;
            outline: none;
            width: 100%;
            padding: 12px;
            transition: .3s;
            height: 51px;
            border-radius: 5px;
            border: 1px solid var(--border-input);
        }

        input[type=text],
        input[type=number],
        textarea {
            box-sizing: border-box;
            margin: 0;
            max-width: 100%;
            font-weight: 500 !important;
            border-radius: 5px;
            font-size: 15px;
            border: 1px solid var(--border-input);
            background: var(--background-input);
            color: var(--primary-black) !important;
            outline: none;
            width: 100%;
            padding: 12px;
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
            min-width: 300px;
        }

        textarea {
            font-family: "Courier New", Courier, monospace;
            overflow: auto;
            transition-duration: 0.4s;
            min-height: 100px;
        }

        input[type=checkbox] {
            display: none;
        }

        label .checkbox {
            height: 13px;
            width: 13px;
            border: 1px solid black;
            display: inline-block;
            margin-right: 5px;
            margin-bottom: 3px;
            vertical-align: middle;
            border-radius: 3px;
        }

        [type=checkbox]:checked + span {
            background: black;
        }

        .label-checkbox {
            font-weight: 500 !important;
            font-size: 13px;
            color: #111 !important;
            display: flex;
            align-items: center;
        }

        .button-dark {
            font: inherit;
            overflow: visible;
            text-transform: none;
            cursor: pointer;
            outline: 0 none;
            border: none;
            border-radius: 5px !important;
            background: var(--primary-black);
            color: var(--white);
            transition-duration: .3s;
            display: inline-block;
            font-size: 14px;
            font-weight: 500;
            padding: 13px 25px 13px 25px;
            min-height: 43px;
        }

            .button-dark:hover {
                background: var(--primary-red);
            }

        .monospace {
            font-family: "Courier New", Courier, monospace;
        }
    </style>
    <!-- Flags -->
    <input type="hidden" id="rh_ui_flag" value="true" />
    <input type="hidden" id="rh_ui_data" value="false" />

    <!-- Container Wrapper -->
    <div class="grid-container">
        <!-- Header -->
        <div class="grid-template-areas p-15 top-bar">
            <div class="grid-container-3-1">
                <div class="grid-template-areas mr-10">
                    <a target="_blank"
                       href="https://github.com/savanna-projects"
                       style="color: var(--white);">
                        GitHub
                    </a>
                </div>
                <div class="grid-template-areas mr-10">
                    <a target="_blank"
                       href="https://hub.docker.com/r/rhinoapi/rhino-agent"
                       style="color: var(--white);">
                        DockerHub
                    </a>
                </div>
                <div class="grid-template-areas mr-10">
                    <a target="_blank"
                       href="https://github.com/savanna-projects/rhino-agent/blob/master/docs/pages/Home.md"
                       style="color: var(--white);">
                        Documentation
                    </a>
                </div>
            </div>
        </div>

        <!-- Title -->
        <div class="grid-template-areas top-panel" style="padding: 15px;">
            <span class="font-700 primary-black">Rhino</span><span class="font-700 primary-red">API</span><br />
            <span class="font-300 primary-black">Automation Integrator</span>
        </div>
        <div class="grid-template-areas">
            <!-- Body Wrapper -->
            <div class="grid-container-body">
                <!-- Title -->
                <div class="grid-template-areas mb-15">
                    <span class="font-700-s primary-black"
                          title="Set playback options such as browser type and driver capabilities.">
                        Playback Settings
                    </span>
                </div>
                <div class="grid-template-areas mb-15">
                    <span class="font-700-s primary-black">Integration Settings</span>
                </div>
                <!-- Playback Settings Wrapper -->
                <div class="grid-container-2-5" style="margin: 0; padding: 0; margin-right: 15px;">
                    <div class="grid-template-areas mr-10 middleable">
                        <span class="font-500-s middle"
                              title="Browser or platform on which this test or set will run.">
                            Browser (Platform):
                        </span>
                    </div>
                    <div class="grid-template-areas">
                        <select id="rh_web_driver" class="rh-input">
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

                    <div class="grid-template-areas mr-10 middleable">
                        <span class="font-500-s middle"
                              title="Web Driver location. Can be a local folder, Grid endpoint or 3rd party Grid endpoint.">
                            Driver Endpoint:
                        </span>
                    </div>
                    <div class="grid-template-areas">
                        <input id="rh_grid_endpoint"
                               type="text"
                               placeholder="e.g http://localhost:4444/wd/hub"
                               style="font-family: monospace;" />
                    </div>

                    <div class="grid-template-areas mr-10 middleable">
                        <span class="font-500-s middle"
                              title="The maximum number of tests that will be executed in parallel.">
                            Max Parallel Execution:
                        </span>
                    </div>
                    <div class="grid-template-areas">
                        <input id="rh_max_parallel" value="1" type="number" min="1" />
                    </div>

                    <div class="grid-template-areas mr-10">
                        <span class="font-500-s"
                              title="The capabilities of the selected platform as supported by the respective vendor.">
                            Driver Capabilities:
                        </span>
                    </div>
                    <div class="grid-template-areas">
                        <textarea id="rh_driver_capabilities" name="Driver capabilities">{}</textarea>
                    </div>

                    <div class="grid-template-areas mr-10">
                        <span class="font-500-s"
                              title="The options of the selected platform as supported by the respective vendor.">
                            Driver Options:
                        </span>
                    </div>
                    <div class="grid-template-areas">
                        <textarea id="rh_driver_options" name="Driver Options">{}</textarea>
                    </div>
                </div>
                <!-- Integration Settings Wrapper -->
                <div class="grid-container-1-15" style="margin: 0; padding: 0;">
                    <div class="grid-template-areas mr-5 middleable">
                        <label class="font-500-s middle"
                               title="Check for creating test run reports under the integrated system (i.e. Jira, Azure DevOps, etc.)">
                            <input type="checkbox" id="rh_create_execution">
                            <span class="checkbox"></span>
                            <span class="primary-black">Create Execution</span>
                        </label>
                    </div>
                    <div class="grid-template-areas mr-5 middleable">
                        <label class="font-500-s middle"
                               title="Check for activating Bugs Manager for this run. Bugs Manager will open, close and update bugs during the run.">
                            <input type="checkbox" id="rh_open_close_bugs">
                            <span class="checkbox"></span>
                            <span class="primary-black">Open/Close Bugs</span>
                        </label>
                    </div>
                    <div class="grid-template-areas mr-5 middleable">
                        <label class="font-500-s middle"
                               title="Check for creating Rhino report in addition to any other report already generated by this run. Adding additional reporters can be done under Options page.">
                            <input type="checkbox" id="rh_create_report">
                            <span class="checkbox"></span>
                            <span class="primary-black">Create Rhino Report</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <div class="grid-template-areas ml-15 mr-15 mb-15">
            <button class="button-dark"
                    id="rh_run_automation"
                    data-rhino="false"
                    title="Run the selected tests or sets using saved options and user options.">
                Run Automation
            </button>

            <button class="button-dark"
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