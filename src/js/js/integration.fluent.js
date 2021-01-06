"use strict";

//┌─[ CALSS ]───────────────────────────────────┐
//│                                             │
//│ ## GENERAL                                  │
//│ Responsible for building a unified message  │
//│ for sending between the different services. │
//└─────────────────────────────────────────────┘
//
/**
* Summary. Builds a unifies message for sending between the different services.
*/
class MessageBuilder {
    /**
    * Summary. Creates a new instance of MessageBuilder.
    */
    constructor() {
        this.from = '';
        this.route = '';
        this.data = {};
        this.issuer = {};
        this.routeBack = '';
        this.action = '';
        this.statusCode = -1;
    }

    /**
    * Summary. Sets the origin of the message.
    * 
    * @param {string} from The origin of the message.
    * 
    * @returns {MessageBuilder} Self reference of this MessageBuilder.
    */
    withFrom(from) {
        this.from = from;
        return this;
    }

    /**
    * Summary. Sets the route (the destination method) of the message.
    *
    * @param {string} route The route (the destination method) of the message.
    *
    * @returns {MessageBuilder} Self reference of this MessageBuilder.
    */
    withRoute(route) {
        this.route = route;
        return this;
    }

    /**
    * Summary. Sets the data (the request body) of the message.
    *
    * @param {any} data The data (the request body) of the message.
    *
    * @returns {MessageBuilder} Self reference of this MessageBuilder.
    */
    withData(data) {
        this.data = data;
        return this;
    }

    /**
    * Summary. Sets the issuer (message original creator) of the message.
    *
    * @param {any} issuer The issuer (message original creator) of the message.
    *
    * @returns {MessageBuilder} Self reference of this MessageBuilder.
    */
    withIssuer(issuer) {
        this.issuer = issuer;
        return this;
    }

    /**
    * Summary. Sets the route back (the callback destination method) of the message.
    *
    * @param {string} routeBack The route back (the callback destination method) of the message.
    *
    * @returns {MessageBuilder} Self reference of this MessageBuilder.
    */
    withRouteBack(routeBack) {
        this.routeBack = routeBack;
        return this;
    }

    /**
    * Summary. Sets the action identifier of the message.
    *
    * @param {string} action The action identifier of the message.
    *
    * @returns {MessageBuilder} Self reference of this MessageBuilder.
    */
    withAction(action) {
        this.action = action;
        return this;
    }

    /**
    * Summary. Sets the status code of the message.
    *
    * @param {number} statusCode The status code of the message.
    *
    * @returns {MessageBuilder} Self reference of this MessageBuilder.
    */
    withStatusCode(statusCode) {
        this.statusCode = statusCode;
        return this;
    }

    /**
    * Summary. Builds a message. If values were not specified, defaults will be taken.
    *
    * @returns {any} A message object.
    */
    build() {
        return {
            from: this.from,
            statusCode: this.statusCode,
            route: this.route,
            data: this.data,
            issuer: this.issuer,
            routeBack: this.routeBack,
            action: this.action
        }
    }
}

//┌─[ CALSS ]───────────────────────────────────┐
//│                                             │
//│ ## GENERAL                                  │
//│ Responsible for building a Rhino Service    │
//│ factory ready to be injected into a client. │
//└─────────────────────────────────────────────┘
//
/**
* Summary. Builds a routine for injecting Rhino.
*/
class RhinoServiceBuilder {
    /**
    * Summary. Creates a new instance of RhinoServiceBuilder.
    */
    constructor() {
        this.persistent = false;
        this.html = '';
        this.connector = 'connector_text';
        this.confirmSite = () => console.debug('confirmSite not implemented.');
        this.exists = () => console.debug('exists not implemented.');
        this.container = () => console.debug('container not implemented.');
        this.testCases = () => console.debug('tests not implemented.');
        this.connectorCapabilities = () => console.debug('connectorCapabilities not implemented.');
        this.inject = () => console.debug('inject not implemented.');
    }

    /**
    * Summary. Sets the confirmSite (verify that site is compliant for integration) method.
    *
    * @param {any} func A boolean function with no arguments.
    *
    * @returns {RhinoServiceBuilder} Self reference of this MessageBuilder.
    */
    setConfirmSiteCondition(func) {
        this.confirmSite = func;
        return this;
    }

    /**
    * Summary. Sets the isExists (check if Rhino is already injected) method.
    *
    * @param {any} func A boolean function with no arguments.
    *
    * @returns {RhinoServiceBuilder} Self reference of this MessageBuilder.
    */
    setExistsCondition(func) {
        this.exists = func;
        return this;
    }

    /**
    * Summary. Sets the getContainer (client container element under which Rhino will be injected) method.
    *
    * @param {any} func A function with no arguments that returns DOM element.
    *
    * @returns {RhinoServiceBuilder} Self reference of this MessageBuilder.
    */
    setContainerFactory(func) {
        this.container = func;
        return this;
    }

    /**
    * Summary. Sets the getTestCases (test cases to run when sending automation request to Rhino) method.
    *
    * @param {any} func A function with no arguments that returns a string array.
    *
    * @returns {RhinoServiceBuilder} Self reference of this MessageBuilder.
    */
    setTestsFactory(func) {
        this.testCases = func;
        return this;
    }

    /**
    * Summary. Sets the connector to use with this builder.
    *
    * @param {string} connector The connector to use with this builder.
    *
    * @returns {RhinoServiceBuilder} Self reference of this MessageBuilder.
    */
    setConnector(connector) {
        this.connector = connector;
        return this;
    }

    /**
    * Summary. Sets the getConnectorCapabilities (an object of connector specific settings and information) method.
    *
    * @param {any} func A function with no arguments that returns an object.
    *
    * @returns {RhinoServiceBuilder} Self reference of this MessageBuilder.
    */
    setConnectorCapabilitiesFactory(func) {
        this.connectorCapabilities = func;
        return this;
    }

    /**
    * Summary. Sets the HTML to use with this builder.
    *
    * @param {string} html The HTML to use with this builder.
    *
    * @returns {RhinoServiceBuilder} Self reference of this MessageBuilder.
    */
    setHtml(html) {
        this.html = html;
        return this;
    }

    /**
    * Summary. Sets the persistence mode of this builder.
    *          If the builder is inside interval, settings the persistent to false, will clear the interval once Rhino is injected.
    *
    * @param {boolean} persistent Set to true for persistent mode (will run infinitely). Default is false.
    *
    * @returns {RhinoServiceBuilder} Self reference of this MessageBuilder.
    */
    setPersistent(persistent) {
        this.persistent = persistent;
        return this;
    }

    /**
    * Summary. Sets the injection (injecting Rhino into the client) method.
    *
    * @param {any} func A function that takes 3 arguments, container, test data factory and HTML.
    *
    * @returns {RhinoServiceBuilder} Self reference of this MessageBuilder.
    */
    setInjectMethod(func) {
        this.inject = func;
        return this;
    }

    /**
    * Summary. Starts Rhino injection routine, can be used under a function which is wrapped inside an interval.
    *
    * @param {any} interval The interval wrapper (if used inside an interval).
    */
    start(interval) {
        try {
            // setup
            var isSite = this.confirmSite() && !this.exists();

            // exit conditions
            if (!isSite) {
                return;
            }

            // clear conditions
            if (!isNullOrEmpty(interval) && !this.persistent) {
                clearInterval(interval);
            }

            // setup - inject
            var container = this.container();
            var testsDataFactory = () => {
                // build
                var data = {
                    testCases: this.testCases()
                };
                data["capabilities"] = {};
                data["capabilities"][this.connector + ":options"] = this.connectorCapabilities();

                // get
                return data;
            }

            // expose on UI
            this.inject(container, () => testsDataFactory(), this.html);
        } catch (e) {
            console.error('Start-Rhino = 500 internal server error')
            console.error(e);
        }
    }
}