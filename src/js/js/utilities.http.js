/**
 * Summary. Executes a get request with onSuccess callback
 * 
 * @param {any} routing   Endpoint to which send the request.
 * @param {any} onSuccess Success callback action.
 * @param {any} onError   Error callback action.
 * @param {any} onAlways  Finalize callback action, will always be executed
 */
function get(routing, onSuccess, onError, onAlways) {
    // setup
    var xmlHttp = new XMLHttpRequest();

    // async waiter
    xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState === 4 && xmlHttp.status >= 200) {
            onSuccess(xmlHttp.responseText);
        }
    }

    // error handler
    xmlHttp.onerror = () => {
        onError(xmlHttp.responseText);
    }

    // async call
    xmlHttp.open("GET", routing, true);
    xmlHttp.send(null);
}

/**
 * Summary. Executes a post request with onSuccess callback
 * 
 * @param {any} routing   Endpoint to which send the request
 * @param {any} data      Data Object to pass with this request as body
 * @param {any} onSuccess Success callback action
 * @param {any} onError   Error callback action
 * @param {any} onAlways  Finalize callback action, will always be executed
 */
function post(routing, data, onSuccess, onError, onAlways) {
    try {
        // setup
        var xmlHttp = new XMLHttpRequest();

        // async waiter
        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState === 4 && xmlHttp.status >= 200) {
                onSuccess(xmlHttp.responseText);
            }
        }
        xmlHttp.onerror = (event) => {
            onError(event);
        }

        // async call
        xmlHttp.open("POST", routing, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xmlHttp.send(JSON.stringify(data));
    } finally {
        onAlways();
    }
}