"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isWindowDefined() {
    return typeof window !== 'undefined';
}
exports.isWindowDefined = isWindowDefined;
function removeCssClassName(element, cssClassName) {
    element.className = element.className.replace(cssClassName, '');
}
exports.removeCssClassName = removeCssClassName;
function addCssClassName(element, cssClassName) {
    if (!element.className.includes(cssClassName)) {
        element.className += " " + cssClassName;
    }
}
exports.addCssClassName = addCssClassName;
function hasCssClassName(element, cssClassName) {
    return element.className && element.className.includes(cssClassName);
}
exports.hasCssClassName = hasCssClassName;
//# sourceMappingURL=utils.js.map