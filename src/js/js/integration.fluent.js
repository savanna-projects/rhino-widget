//┌─[ CALSS ]───────────────────────────────────┐
//│                                             │
//│ ## GENERAL                                  │
//│ Responsible for building a unified message  │
//│ for sending between the different services. │
//└─────────────────────────────────────────────┘
//
"use strict";

/**
* Summary. Builds a unifies message for sending between the different services.
*/
class MessageBuilder {
    constructor() {
        this.from = '';
        this.route = '';
        this.data = {};
        this.issuer = {};
        this.routeBack = '';
        this.action = '';
        this.statusCode = -1;
    }

    withFrom(from) {
        this.from = from;
        return this;
    }

    withRoute(route) {
        this.route = route;
        return this;
    }

    withData(data) {
        this.data = data;
        return this;
    }

    withIssuer(issuer) {
        this.issuer = issuer;
        return this;
    }

    withRouteBack(routeBack) {
        this.routeBack = routeBack;
        return this;
    }

    withAction(action) {
        this.action = action;
        return this;
    }

    withStatusCode(statusCode) {
        this.statusCode = statusCode;
        return this;
    }

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