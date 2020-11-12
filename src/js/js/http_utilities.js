/**
 * Summary. Executes a get request with onSuccess callback
 * 
 * @param {any} routing   Endpoint to which send the request
 * @param {any} onSuccess Success callback action
 */
function get(routing, onSuccess) {
    $.ajax({
        url: routing,
        type: "GET",
        dataType: "json",

        success: (data) => {
            onSuccess(data);
        },
        error: (e) => {
            console.log(e);
            console.log("Error while calling the Web API on [" + routing + "]");
        }
    });
}

/**
 * Summary. Executes a post request with onSuccess callback
 * 
 * @param {any} routing   Endpoint to which send the request
 * @param {any} data      Data Object to pass with this request as body
 * @param {any} onSuccess Success callback action
 * @param {any} onAlways  Finalize callback action, will always be executed
 */
function post(routing, data, onSuccess, onAlways) {
    // elevate properties
    //data.config.driverCapabilities = data.config.driverParameters.capabilities;
    //data.config.driverOptions = data.config.driverParameters.options;

    // send
    $.ajax({
        url: routing,
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),

        success: (data) => {
            onSuccess(data);
        },
        error: (e) => {
            console.log(e);
            console.log("Error while calling the Web API on [" + routing + "]");
        }
    }).always(onAlways);
}