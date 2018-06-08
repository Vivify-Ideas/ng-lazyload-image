"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var operators_1 = require("rxjs/operators");
var empty_1 = require("rxjs/observable/empty");
var Observable_1 = require("rxjs/Observable");
var utils_1 = require("./utils");
var scrollListeners = new WeakMap();
function sampleObservable(obs, scheduler) {
    return obs.pipe(operators_1.sampleTime(100, scheduler), operators_1.share(), operators_1.startWith(''));
}
exports.sampleObservable = sampleObservable;
exports.getScrollListener = function (scrollTarget) {
    if (!scrollTarget || typeof scrollTarget.addEventListener !== 'function') {
        if (utils_1.isWindowDefined()) {
            console.warn('`addEventListener` on ' + scrollTarget + ' (scrollTarget) is not a function. Skipping this target');
        }
        return empty_1.empty();
    }
    if (scrollListeners.has(scrollTarget)) {
        return scrollListeners.get(scrollTarget);
    }
    var srollEvent = Observable_1.Observable.create(function (observer) {
        var eventName = 'scroll';
        var handler = function (event) { return observer.next(event); };
        var options = { passive: true, capture: false };
        scrollTarget.addEventListener(eventName, handler, options);
        return function () { return scrollTarget.removeEventListener(eventName, handler, options); };
    });
    var listener = sampleObservable(srollEvent);
    scrollListeners.set(scrollTarget, listener);
    return listener;
};
//# sourceMappingURL=scroll-listener.js.map