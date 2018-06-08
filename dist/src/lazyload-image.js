"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var operators_1 = require("rxjs/operators");
var Observable_1 = require("rxjs/Observable");
var rect_1 = require("./rect");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
require("rxjs/add/observable/of");
function isVisible(element, threshold, _window, scrollContainer) {
    if (threshold === void 0) { threshold = 0; }
    var elementBounds = rect_1.Rect.fromElement(element);
    var windowBounds = rect_1.Rect.fromWindow(_window);
    elementBounds.inflate(threshold);
    if (scrollContainer) {
        var scrollContainerBounds = rect_1.Rect.fromElement(scrollContainer);
        var intersection = scrollContainerBounds.getIntersectionWith(windowBounds);
        return elementBounds.intersectsWith(intersection);
    }
    else {
        return elementBounds.intersectsWith(windowBounds);
    }
}
exports.isVisible = isVisible;
function isChildOfPicture(element) {
    return Boolean(element.parentElement && element.parentElement.nodeName.toLowerCase() === 'picture');
}
exports.isChildOfPicture = isChildOfPicture;
function isImageElement(element) {
    return element.nodeName.toLowerCase() === 'img';
}
exports.isImageElement = isImageElement;
function loadImage(element, imagePath, useSrcset) {
    var img;
    if (isImageElement(element) && isChildOfPicture(element)) {
        var parentClone = element.parentNode.cloneNode(true);
        img = parentClone.getElementsByTagName('img')[0];
        setSourcesToLazy(img);
        setImage(img, imagePath, useSrcset);
    }
    else {
        img = new Image();
        if (isImageElement(element) && element.sizes) {
            img.sizes = element.sizes;
        }
        if (useSrcset) {
            img.srcset = imagePath;
        }
        else {
            img.src = imagePath;
        }
    }
    return Observable_1.Observable
        .create(function (observer) {
        img.onload = function () {
            observer.next(imagePath);
            observer.complete();
        };
        img.onerror = function (err) {
            observer.error(null);
        };
    });
}
function setImage(element, imagePath, useSrcset) {
    if (isImageElement(element)) {
        if (useSrcset) {
            element.srcset = imagePath;
        }
        else {
            element.src = imagePath;
        }
    }
    else {
        element.style.backgroundImage = "url('" + imagePath + "')";
    }
    return element;
}
function setSources(attrName) {
    return function (image) {
        var sources = image.parentElement.getElementsByTagName('source');
        for (var i = 0; i < sources.length; i++) {
            var attrValue = sources[i].getAttribute(attrName);
            if (attrValue) {
                sources[i].srcset = attrValue;
            }
        }
    };
}
var setSourcesToDefault = setSources('defaultImage');
var setSourcesToLazy = setSources('lazyLoad');
var setSourcesToError = setSources('errorImage');
function setImageAndSources(setSourcesFn) {
    return function (element, imagePath, useSrcset) {
        if (isImageElement(element) && isChildOfPicture(element)) {
            setSourcesFn(element);
        }
        if (imagePath) {
            setImage(element, imagePath, useSrcset);
        }
    };
}
var setImageAndSourcesToDefault = setImageAndSources(setSourcesToDefault);
var setImageAndSourcesToLazy = setImageAndSources(setSourcesToLazy);
var setImageAndSourcesToError = setImageAndSources(setSourcesToError);
function lazyLoadImage(element, imagePath, defaultImagePath, errorImgPath, offset, useSrcset, scrollContainer) {
    if (useSrcset === void 0) { useSrcset = false; }
    setImageAndSourcesToDefault(element, defaultImagePath, useSrcset);
    if (utils_1.hasCssClassName(element, constants_1.cssClassNames.loaded)) {
        utils_1.removeCssClassName(element, constants_1.cssClassNames.loaded);
    }
    return function (scrollObservable) {
        return scrollObservable.pipe(operators_1.filter(function () { return isVisible(element, offset, window, scrollContainer); }), operators_1.take(1), operators_1.mergeMap(function () { return loadImage(element, imagePath, useSrcset); }), operators_1.tap(function () { return setImageAndSourcesToLazy(element, imagePath, useSrcset); }), operators_1.map(function () { return true; }), operators_1.catchError(function () {
            setImageAndSourcesToError(element, errorImgPath, useSrcset);
            utils_1.addCssClassName(element, constants_1.cssClassNames.failed);
            return Observable_1.Observable.of(false);
        }), operators_1.tap(function () { return utils_1.addCssClassName(element, constants_1.cssClassNames.loaded); }));
    };
}
exports.lazyLoadImage = lazyLoadImage;
//# sourceMappingURL=lazyload-image.js.map