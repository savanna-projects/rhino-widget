"use strict";

//┌─[ SETUP ]───────────────────────────────────┐
//│                                             │
//│ Set all global, static and constants.       │
//└─────────────────────────────────────────────┘
//
//-- local parameters
var knownServers = [
    "Rhino Recorder Client - nygGKTtD",
    "Rhino Widget - nygGKTtD"
];

var trustedWindows = [
    "ui"
];

//┌─[ UTILITIES ]───────────────────────────────┐
//│                                             │
//│ General purposes functions and helpers.     │
//└─────────────────────────────────────────────┘
//
/**
 * Summary: Prettify a JSON value inside text element. If the JSON is invalid, an alert will popup.
 * 
 *@param {string} element The element event arguments.
 */
function prettify(element) {
    try {
        // setup
        var json = element.currentTarget.value;

        // prettify
        var objt = JSON.parse(json);
        json = JSON.stringify(objt, null, 4);

        // set
        element.currentTarget.value = json;
    } catch (e) {
        alert('Invalid JSON in ' + element.currentTarget.getAttribute('name') + ', please verify and fix the errors.');
    }
}

/**
 * Returns a collection of known clients pages (based on their title and token).
 * 
 * @returns {Array} a collection of known clients pages.
 */
function getKnownServers() {
    return knownServers;
}

/**
 * Returns a collection of known clients pages (based on their title and token).
 * 
 * @param name    {string}  The name to return.
 * @param reverse {boolean} Set true to a reverse representation of the provided name.
 * 
 * @returns {string} The name provided or a reverse representation of it.
 */
function getName(name, reverse) {
	return reverse ? [...name].reverse().join('') : name;
}

/**
 * Returns true if Rhino Recorder Server is already open.
 *
 * @param windows {Array} A collection of windows to iterate when looking for server window.
 *
 * @returns {boolean} true if Recorder Server is open or false if not.
 */
function isServerOpen(windows) {
    // exit conditions
    if (typeof (windows) === 'undefined' || windows === null) {
        return false;
    }

    // iterate
    for (var i = 0; i < windows.length; i++) {
        for (var j = 0; j < windows[i].tabs.length; j++) {
            if (!knownServers.includes(windows[i].tabs[j].title)) {
                continue;
            }
            return true;
        }
    }
    return false;
}

/**
 * Returns true provided URL pattern match any URL in the provided list.
 *
 * @param list {Array}  A collection URLs to iterate.
 * @param url  {string} A pattern (regular expression) to match by.
 *
 * @returns {boolean} true if any match or false if not.
 */
function isIgnored(list, url) {
    // iterate
    for (var i = 0; i < list.length; i++) {
        var ignored = url.match(list[i]) !== null && url.match(list[i]).length > 0;
        if (ignored) {
            return true;
        }
    }

    // not ignored
    return false;
}

/**
 * Inject Recorder Client scripts into the current active tab.
 * 
 * @param clientFile {string} The file to inject (use path - relative or absolute).
 * @param setMode   {boolean} True for setting the client file as recorderMode into background state.
 * @param callback      {any} A function to run when injection is complete.
 */
function getRecorderClient(clientFile, setMode, callback) {
    try {
        chrome.storage.sync.get(['ignoreList'], (result) => {
            // setup
            var isResult = typeof (result) !== 'undefined' && result !== null;
            var isList = isResult && typeof (result.ignoreList) !== 'undefined' && result.ignoreList !== null && result.ignoreList.length > 0;
            var list = isList ? result.ignoreList : [];

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                for (var i = 0; i < tabs.length; i++) {
                    var id = tabs[i].id;
                    if (knownServers.includes(tabs[i].title) || isIgnored(list, tabs[i].url)) {
                        continue;
                    }
                    chrome.tabs.executeScript(id, { file: clientFile }, () => {
                        if (setMode) {
                            chrome.storage.sync.set({ recorderMode: clientFile }, () => {
                                callback();
                            });
                        }
                        callback();
                    });
                }
            });
        });
    } catch (e) {
        console.info("Get-RecorderClient = 500 internal server error");
        console.log(e);
    }
}

/**
 * Get the current Rhino Active Flag status.
 * 
 * @returns {boolean} true if active or false if not.
 */
function getFlag() {
    // find
    var hiddenElement = document.getElementById('rhinoActive');

    // setup
    var isElement = typeof (hiddenElement) !== 'undefined' && hiddenElement !== null;

    // get
    return isElement && hiddenElement.getAttribute('active') === 'true';
}

/**
 * Sets the current Rhino Active Flag status.
 * 
 * @param isActive {boolean} Activation status.
 */
function setFlag(isActive) {
    // setup
    var hiddenElement = document.getElementById('rhinoActiveFlag');
    var isElement = typeof (hiddenElement) !== 'undefined' && hiddenElement !== null;

    // clear
    if (isElement) {
        document.removeChild(hiddenElement);
    }

    // create
    var active = isActive ? 'true' : 'false';
    var element = document.createElement('input');

    // setup
    element.setAttribute('type', 'hidden');
    element.setAttribute('active', active);
    element.setAttribute('id', 'rhinoActiveFlag');

    // put
    document.body.appendChild(element);
}

/**
 * Creates an error card with an error message.
 *
 * @param containerSelector {string} A selector for an element under which to create the error message.
 * @param cssClass          {string} The CSS class to apply on the HTML alert card.
 * @param message           {string} The message to display.
 */
function setRhinoMessage(containerSelector, cssClass, message) {
    // setup: prefix
    var prefix = '';
    if (cssClass.toUpperCase().includes('SUCCESS')) {
        prefix = 'Operation Successful!'
    }
    else if (cssClass.toUpperCase().includes('DANGER')) {
        prefix = 'Oh snap!'
    }

    // setup: HTML
    var html = `
        <div class="alert alert-dismissible $(cssClass)" style="margin-bottom: 0px;" id="rhinoMessage">
            <i class="fas fa-window-close" style="cursor: pointer;" data-dismiss="alert"></i>
            <strong>$(prefix) </strong><span id="errorText">$(message)</span>
        </div>`
        .replace('$(message)', message)
        .replace('$(cssClass)', cssClass)
        .replace('$(prefix)', prefix);    

    // inject
    var container = $(containerSelector);
    container.empty();
    container.append(html);

    // remove
    setTimeout(() => {
        container.empty();
    }, 5000);
}

/**
 * Apply loader animation which blocks the page.
 */
function invokeLoader() {
    var html = `
    <div id="preloader">
        <div class="row loader">
            <div class="loader-icon"></div>
        </div>
    </div>`

    // put
    $('body').append(html);
}

/**
 * Remove loader animation which blocks the page.
 */
function removeLoader(force) {
    if (force) {
        $('#preloader').remove();
        return;
    }
    $('#preloader').fadeOut('normal', () => {
        $(this).remove();
    });
}

/**
 * Gets a request object for sending to back-end API.
 * 
 * @param from      {string} The name of the page from which the request is sent.
 * @param route     {string} The API route to send the request to.
 * @param data      {any}    The data to send (pass empty object - {} if you don't want to pass any data).
 * @param routeBack {string} The route for the callback action when operation is complete.
 * 
 * @returns {any} Ready to sent request object.
 */
function getRequest(from, route, data, routeBack, action) {
    return {
        from: from,
        route: route,
        routeBack: isNullOrEmpty(routeBack) ? '' : routeBack,
        data: data,
        action: isNullOrEmpty(action) ? '' : action
    };
}

/**
 * Gets a response object for sending to clients when calling back-end or middleware API.
 *
 * @param from       {string} The name of the page from which the request is sent.
 * @param statusCode {number} The status code result of the request operation (based on HTTP status codes list).
 * @param data       {any}    The data to send (pass empty object - {} if you don't want to pass any data).
 * @param issuer     {any}    The original component which initiate the request resulting this response.
 * 
 * @returns {any} Ready to sent response object.
 */
function getResponse(from, route, statusCode, data, issuer) {
    return {
        from: from,
        route: route,
        statusCode: statusCode,
        data: data,
        issuer: issuer
    };
}

/**
 * Indicates whether the specified object is null or an empty string ("").
 * 
 * @param {any} obj object to evaluate.
 *
 * @returns {boolean}  true if the value parameter is null or an empty string (""); otherwise, false.
 */
function isNullOrEmpty(obj) {
    // setup conditions
    var isDefined = typeof (obj) !== 'undefined';
    var isNotNull = isDefined && obj !== null;
    var isNotEmpty = Array.isArray(obj) ? obj.length > 0 : obj !== '';

    // get
    return !isDefined || !isNotNull || !isNotEmpty;
}

//┌─[ API FACTORY ]─────────────────────────────┐
//│                                             │
//│ Calls background API request based on       │
//│ sender route and message.                   │
//└─────────────────────────────────────────────┘
//
function messageHandler(request, sender) {
    _messageHandler(request, sender);
}

function windowMessageHandler(event) {
    // exit conditions
    if (!trustedWindows.includes(event.data.from)) {
        return;
    }

    // handle
    _messageHandler(event.data, {});
}

function _messageHandler(request, sender) {
    // exit conditions
    if (typeof (request.from) === 'undefined' || request.from === null || request.from === '') {
        return;
    }

    // setup
    var responseBody = {
        from: request.from,
        route: request.route,
        routeBack: request.routeBack,
        statusCode: -1,
        data: {},
        issuer: sender,
        action: !isNullOrEmpty(request.action) ? request.action : ""
    };

    try {
        // setup conditions
        var isRouteBack = !isNullOrEmpty(request.routeBack);

        // setup
        var actionName = isRouteBack
            ? request.routeBack.substring(request.routeBack.lastIndexOf('/') + 1, request.routeBack.length)
            : request.route.substring(request.route.lastIndexOf('/') + 1, request.route.length);

        var parameters = [request, sender]
        var action = window[actionName];

        // exit conditions
        if (typeof (action) !== 'function') {
            responseBody.data = "Invoke-Action -Route " + request.route + " = 404 not found";
            responseBody.statusCode = 404;
            console.info(responseBody);
            return;
        }

        // run
        action.apply(null, parameters);
    } catch (e) {
        responseBody.data = "Invoke-Action -Route " + request.route + " = 500 Internal server error";
        responseBody.statusCode = 500;
        responseBody["stack"] = e;
        console.log(responseBody);
    }
}

//┌─[ UTILITIES ]───────────────────────────────┐
//│                                             │
//│ General purposes functions and helpers.     │
//└─────────────────────────────────────────────┘
//
/**
 * Summary: Gets a builder for creating a unified message to send across the application.
 *
 * @param {string} from    The message origin.
 * @param {any}    request The request data.
 * @param {any}    sender  The object initiated the request.
 *
 * @returns {MessageBuilder} A builder for creating a unified message.
 */
function getMessageBuilder(from, request, sender) {
    // setup
    var route = isNullOrEmpty(request.route) ? '' : request.route;
    var routeBack = isNullOrEmpty(request.routeBack) ? '' : request.routeBack;
    var action = isNullOrEmpty(request.action) ? '' : request.action;    

    // get
    return new MessageBuilder()
        .withFrom(from)
        .withRoute(route)
        .withIssuer(sender)
        .withRouteBack(routeBack)
        .withAction(action);
}