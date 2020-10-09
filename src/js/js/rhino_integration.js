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
        chrome.storage.sync.get(['widget_settings'], function () {
            waitAndInject()
        });
    });
}

main();