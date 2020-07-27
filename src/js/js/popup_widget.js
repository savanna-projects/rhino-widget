function main() {
    // validation
    var isRhino = document.title === "Rhino Widget - Action Settings Page - Cloud Native - Automation.Kdd.Agent";
    if (isRhino) {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            for (var key in changes) {
                if(key !== 'message') {
                    continue;
                }
                window.postMessage(changes[key].newValue);
            }
        });
        return;
    }

    // constants
    var TOGGLE_KEY = "F7";
    var UNDEF = "undefined";

    // members: state
    var last_background = "";
    var last_element = null;
    var is_fixate = false;
    var port = chrome.runtime.connect({ name: "elementRecorder" });

    // load all event listeners into this document
    document.addEventListener('keyup', keyupHandler);
    document.addEventListener('mouseover', mouseoverHandler);
    document.addEventListener('mouseout', mouseoutHandler);

    // #region *** event handlers   ***
    //
    // Summary. Adds keyup listener into host page
    //          1. Fixate on element
    //          2. Create query selector for this element
    //          3. Create path for this element
    //          4. Send message to widget component with this element information
    //
    function keyupHandler(e) {
        if (e.key !== TOGGLE_KEY) {
            return;
        }
        is_fixate = !is_fixate;

        // exit conditions - do not post message on release fixation
        if (!is_fixate) {
            return;
        }

        // post message with element information to widget
        try {
            var m = getMessage(last_element);
            port.postMessage(m);
        }
        catch (exception) {
            console.warn(exception);
        }
    }

    function getMessage(e) {

        // initialize message
        var message = { tag_name: e.tagName };

        // apply: query selector
        getQuerySelector(e, function (err, selector) {
            if (typeof err !== UNDEF) {
                console.log(err);
            }
            message.query_selector = selector;
        });

        // apply: path
        message.path = getElementPath(e, true).replace(new RegExp('"', 'g'), "'");
        message.path_id = getElementPath(e, false).replace(new RegExp('"', 'g'), "'");
        message.element_id = getElementId(e);
        message.link_text = getLinkText(e);

        // apply: attributes
        message.attributes = getAttributes(e);

        return message;
    }

    // Summary. Adds mouseover listener into host page
    //          1. Set element background to indicate mouse over
    //
    function mouseoverHandler(e) {
        if (is_fixate) {
            return;
        }

        // apply style & appearance
        e.target.focus();
        setBackground(e.target);
    }

    // Summary. Adds mouseout listener into host page
    //          1. Clear element background to indicate mouse out
    //
    function mouseoutHandler(e) {
        if (is_fixate) {
            return;
        }
        clearBackground(e.target);
    }
    // #endregion

    // #region *** host CSS & style ***
    /**
     * Summary. Sets the background of this element.
     * 
     * @param {any} e Element on which to change background.
     */
    function setBackground(e) {
        last_element = e;

        if (e.style.background === "yellow") {
            return;
        }

        last_background = e.style.background;
        e.style.background = "yellow";
    }

    /**
     * Summary. Clears the background of this element to it's original value.
     * 
     * @param {any} e Element on which to change background.
     */
    function clearBackground() {
        if (last_element === null) {
            return;
        }
        last_element.style.background = last_background;
    }
    // #endregion

    // #region *** element          ***
    function getAttributes(element) {
        var attributes = [];
        for (var i = 0; i < element.attributes.length; i++) {
            attributes.push(element.attributes[i].name);
        }
        return attributes;
    }

    // given a document element returns the id string expression of that element.
    function getElementId(e) {
        if (!e.hasAttribute("id")) {
            return "";
        }
        return e.getAttribute("id");
    }

    // given a document element returns the link text string expression of that element.
    function getLinkText(e) {
        // exit conditions
        if (e.tagName.toUpperCase() !== "A") {
            return "";
        }

        // get if unique
        var text = e.text.trim();
        var elements = document.getElementsByTagName("a");
        var counter = 0;
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].text.trim() === text) {
                counter = counter++;
            }
        }

        // results
        return counter > 1 ? "" : e.text;
    }

    /**
     * Summary. Gets a query selector for this element instance.
     * 
     * @param {any} element  Element for which to get query selector.
     * @param {any} callback Callback function to be called after the query selector has been generated.
     * 
     * @return {string} Query selector for this element.
     */
    function getQuerySelector(element, callback) {
        var err, result;
        try {
            // wrong call back
            if (callback && typeof callback !== "function") {
                throw new Error("invalid callback supplied");
            }

            // iterate nodes
            var names = [];
            while (element.parentNode) {
                if (element.id) {
                    names.unshift('#' + element.id);
                    break;
                }

                if (element === element.ownerDocument.documentElement) {
                    names.unshift(element.tagName);
                }
                else {
                    for (var i = 1, e = element; e.previousElementSibling; e = e.previousElementSibling, i++);
                    names.unshift(element.tagName + ":nth-child(" + i + ")");
                }
                element = element.parentNode;
            }
            result = names.join(" > ");
        }
        catch (err) {
            if (!callback) {
                throw err;
            }
        }

        // async mode
        if (callback) {
            callback(err, result);
        } else {
            return result;
        }
    }

    // given a document element returns the path string expression of that element.
    function getElementPath(e, ignoreId) {
        var path = "";
        for (; e && e.nodeType === 1; e = e.parentNode) {
            if (!ignoreId) {
                return getUniqe(e);
            }
            index = getElementPosition(e);
            xname = e.tagName;
            if (!(xname === "HTML" || xname === "HEAD" || xname === "BODY")) {
                xname += "[" + index + "]";
            }
            path = "/" + xname + path;
        }
        return path;
    }

    function getElementPosition(e) {
        var count = 1;
        for (var sib = e.previousSibling; sib; sib = sib.previousSibling) {
            if (sib.nodeType === 1 && sib.tagName === e.tagName) {
                count++;
            }
        }
        return count;
    }

    function getUniqe(e) {
        if (!e.hasAttribute("id")) {
            return "";
        }
        return "//" + e.tagName + "[@id='" + e.id + "']";
    }
    // #endregion

    // execution pipeline
    chrome.storage.sync.get('settings', (o) => {
        // TODO: exit conditions
        var isSettings = Object.entries(o).length !== 0;
        var isProxy = isSettings && o.settings.endpoint !== "";
        var isChrome = window.location.href.startsWith("chrome");

        if (!isProxy || isChrome) {
            return;
        }
    });
}

function resizeWidget() {
    // conditions
    var isExpanded = document.getElementById(TOGGLE).getAttribute("aria-expanded");

    // expand
    if (isExpanded !== "true") {
        document.getElementById(WRAPPER).style = WRAPPER_E;
        return;
    }

    // collapse
    document.getElementById(WRAPPER).style = WRAPPER_C;
}

main();