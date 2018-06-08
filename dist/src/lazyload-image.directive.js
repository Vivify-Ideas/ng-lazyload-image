"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ReplaySubject_1 = require("rxjs/ReplaySubject");
var operators_1 = require("rxjs/operators");
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var scroll_listener_1 = require("./scroll-listener");
var lazyload_image_1 = require("./lazyload-image");
var utils_1 = require("./utils");
var constants_1 = require("./constants");
var LazyLoadImageDirective = (function () {
    function LazyLoadImageDirective(el, ngZone, renderer, document) {
        this.renderer = renderer;
        this.onLoad = new core_1.EventEmitter();
        this.doc = document;
        this.elementRef = el;
        this.ngZone = ngZone;
        this.propertyChanges$ = new ReplaySubject_1.ReplaySubject();
        this.renderer.addClass(el.nativeElement, constants_1.cssClassNames.applied);
    }
    LazyLoadImageDirective_1 = LazyLoadImageDirective;
    LazyLoadImageDirective.prototype.ngOnChanges = function (changes) {
        this.propertyChanges$.next({
            lazyImage: this.lazyImage ? this.lazyImage : LazyLoadImageDirective_1._defaultConfig['lazyImage'],
            defaultImage: this.defaultImage ? this.defaultImage : LazyLoadImageDirective_1._defaultConfig['defaultImage'],
            errorImage: this.errorImage ? this.errorImage : LazyLoadImageDirective_1._defaultConfig['errorImage'],
            scrollTarget: this.scrollTarget ? this.scrollTarget : LazyLoadImageDirective_1._defaultConfig['scrollTarget'],
            scrollObservable: this.scrollObservable ? this.scrollObservable : LazyLoadImageDirective_1._defaultConfig['scrollObservable'],
            offset: this.offset ? this.offset : LazyLoadImageDirective_1._defaultConfig['offset'] | 0,
            useSrcset: this.useSrcset ? this.useSrcset : LazyLoadImageDirective_1._defaultConfig['useSrcset'],
            ssrImageLimitCount: this.ssrImageLimitCount ? this.ssrImageLimitCount : LazyLoadImageDirective_1._defaultConfig['ssrImageLimitCount'] | 0
        });
    };
    LazyLoadImageDirective.prototype.ngAfterContentInit = function () {
        var _this = this;
        var ssr = false;
        if (!utils_1.isWindowDefined()) {
            ssr = true;
        }
        this.ngZone.runOutsideAngular(function () {
            var scrollObservable;
            if (_this.scrollObservable) {
                scrollObservable = _this.scrollObservable.startWith('');
            }
            else {
                var windowTarget = utils_1.isWindowDefined() ? window : undefined;
                scrollObservable = scroll_listener_1.getScrollListener(_this.scrollTarget || windowTarget);
            }
            if (ssr) {
                setTimeout(function () { return _this.propertyChanges$.subscribe(function (props) {
                    return _this.ssrLazyLoadImage(_this.elementRef.nativeElement, props.lazyImage, props.defaultImage, props.useSrcset, props.ssrImageLimitCount);
                }); }, 100);
            }
            else {
                _this.scrollSubscription = _this.propertyChanges$.pipe(operators_1.debounceTime(10), operators_1.switchMap(function (props) { return scrollObservable.pipe(lazyload_image_1.lazyLoadImage(_this.elementRef.nativeElement, props.lazyImage, props.defaultImage, props.errorImage, props.offset, props.useSrcset, props.scrollTarget)); })).subscribe(function (success) { return _this.onLoad.emit(success); });
            }
        });
    };
    LazyLoadImageDirective.prototype.ssrLazyLoadImage = function (element, imagePath, defaultImagePath, useSrcset, ssrImageLimitCount) {
        if (useSrcset === void 0) { useSrcset = false; }
        this.renderer.setAttribute(element, 'src', defaultImagePath);
        var firstNImages = Array.from(this.doc.body.getElementsByClassName(constants_1.cssClassNames.applied)).slice(0, ssrImageLimitCount);
        if (this.isInFirstNImages(firstNImages, element)) {
            this.setImage(element, imagePath, useSrcset);
        }
    };
    LazyLoadImageDirective.prototype.setImage = function (element, imagePath, useSrcset) {
        if (lazyload_image_1.isImageElement(element)) {
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
    };
    LazyLoadImageDirective.prototype.isInFirstNImages = function (firstNImages, element) {
        return firstNImages.find(function (img) {
            return img == element;
        });
    };
    LazyLoadImageDirective.setDefaultConfig = function (config) {
        LazyLoadImageDirective_1._defaultConfig = Object.assign(config, LazyLoadImageDirective_1._defaultConfig);
    };
    LazyLoadImageDirective.prototype.ngOnDestroy = function () {
        [this.scrollSubscription]
            .filter(function (subscription) { return subscription && !subscription.isUnsubscribed; })
            .forEach(function (subscription) { return subscription.unsubscribe(); });
    };
    LazyLoadImageDirective._defaultConfig = {};
    __decorate([
        core_1.Input('lazyLoad'),
        __metadata("design:type", Object)
    ], LazyLoadImageDirective.prototype, "lazyImage", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], LazyLoadImageDirective.prototype, "defaultImage", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], LazyLoadImageDirective.prototype, "errorImage", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], LazyLoadImageDirective.prototype, "scrollTarget", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], LazyLoadImageDirective.prototype, "scrollObservable", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], LazyLoadImageDirective.prototype, "offset", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], LazyLoadImageDirective.prototype, "useSrcset", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], LazyLoadImageDirective.prototype, "ssrImageLimitCount", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], LazyLoadImageDirective.prototype, "onLoad", void 0);
    LazyLoadImageDirective = LazyLoadImageDirective_1 = __decorate([
        core_1.Directive({
            selector: '[lazyLoad]'
        }),
        __param(3, core_1.Inject(common_1.DOCUMENT)),
        __metadata("design:paramtypes", [core_1.ElementRef, core_1.NgZone, core_1.Renderer2, Object])
    ], LazyLoadImageDirective);
    return LazyLoadImageDirective;
    var LazyLoadImageDirective_1;
}());
exports.LazyLoadImageDirective = LazyLoadImageDirective;
//# sourceMappingURL=lazyload-image.directive.js.map