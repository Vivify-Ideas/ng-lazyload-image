import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { switchMap, debounceTime } from 'rxjs/operators';
import {
    AfterContentInit,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    Output,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    Renderer2,
    Inject
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { getScrollListener } from './scroll-listener';
import { isImageElement, lazyLoadImage } from './lazyload-image';
import { isWindowDefined } from './utils';
import { cssClassNames } from './constants';

interface LazyLoadImageDirectiveProps {
    lazyImage: string;
    defaultImage: string;
    errorImage: string;
    scrollTarget: any;
    scrollObservable: Observable<Event>;
    offset: number;
    useSrcset: boolean;
    ssrImageLimitCount: number;
    useNoScript: boolean;
    description: string;
}

@Directive({
    selector: '[lazyLoad]'
})
export class LazyLoadImageDirective implements OnChanges, AfterContentInit, OnDestroy {
    @Input('lazyLoad') lazyImage;           // The image to be lazy loaded
    @Input() defaultImage: string;          // The image to be displayed before lazyImage is loaded
    @Input() errorImage: string;            // The image to be displayed if lazyImage load fails
    @Input() scrollTarget: any;             // Scroll container that contains the image and emits scoll events
    @Input() scrollObservable;              // Pass your own scroll emitter
    @Input() offset: number;                // The number of px a image should be loaded before it is in view port, defaults to 300
    @Input() useSrcset: boolean;            // Whether srcset attribute should be used instead of src
    @Input() ssrImageLimitCount: number;    // number of images to lazy load in ssr mode
    @Input() useNoScript: boolean;          // whether to add <noscript> + <img> tag on ssr for SEO
    @Input() description: string;           // image description (used primarily for alt and title attributes)
    @Output() onLoad: EventEmitter<boolean> = new EventEmitter(); // Callback when an image is loaded
    private propertyChanges$: ReplaySubject<LazyLoadImageDirectiveProps>;
    private elementRef: ElementRef;
    private ngZone: NgZone;
    private scrollSubscription;

    private static _defaultConfig = {};
    private doc;

    constructor(el: ElementRef, ngZone: NgZone, private renderer: Renderer2, @Inject(DOCUMENT) document) {
        this.doc = document;
        this.elementRef = el;
        this.ngZone = ngZone;
        this.propertyChanges$ = new ReplaySubject();
        this.renderer.addClass(el.nativeElement, cssClassNames.applied);
    }

    ngOnChanges(changes?: SimpleChanges) {
        this.propertyChanges$.next({
            lazyImage: this.lazyImage ? this.lazyImage : LazyLoadImageDirective._defaultConfig['lazyImage'],
            defaultImage: this.defaultImage ? this.defaultImage : LazyLoadImageDirective._defaultConfig['defaultImage'],
            errorImage: this.errorImage ? this.errorImage : LazyLoadImageDirective._defaultConfig['errorImage'],
            scrollTarget: this.scrollTarget ? this.scrollTarget : LazyLoadImageDirective._defaultConfig['scrollTarget'],
            scrollObservable: this.scrollObservable ? this.scrollObservable : LazyLoadImageDirective._defaultConfig['scrollObservable'],
            offset: this.offset ? this.offset : LazyLoadImageDirective._defaultConfig['offset'] | 0,
            useSrcset: this.useSrcset ? this.useSrcset : LazyLoadImageDirective._defaultConfig['useSrcset'],
            ssrImageLimitCount: this.ssrImageLimitCount ? this.ssrImageLimitCount : LazyLoadImageDirective._defaultConfig['ssrImageLimitCount'] | 0,
            useNoScript: this.useNoScript ? this.useNoScript : LazyLoadImageDirective._defaultConfig['useNoScript'],
            description: this.description ? this.description : LazyLoadImageDirective._defaultConfig['description']
        });
    }

    ngAfterContentInit() {
        let ssr = false;

        if (!isWindowDefined()) {
            ssr = true;
        }

        this.ngZone.runOutsideAngular(() => {
            let scrollObservable: Observable<Event>;
            if (this.scrollObservable) {
                scrollObservable = this.scrollObservable.startWith('');
            } else {
                const windowTarget = isWindowDefined() ? window : undefined;
                scrollObservable = getScrollListener(this.scrollTarget || windowTarget);
            }

            if (ssr) {
                setTimeout(() => this.propertyChanges$.subscribe(
                    (props) =>
                        this.ssrLazyLoadImage(
                            this.elementRef.nativeElement,
                            props.lazyImage,
                            props.defaultImage,
                            props.useSrcset,
                            props.ssrImageLimitCount,
                            props.useNoScript,
                            props.description
                        )
                ), 100);

            } else {
                this.scrollSubscription = this.propertyChanges$.pipe(
                    debounceTime(10),
                    switchMap(props => scrollObservable.pipe(
                        lazyLoadImage(
                            this.elementRef.nativeElement,
                            props.lazyImage,
                            props.defaultImage,
                            props.errorImage,
                            props.offset,
                            props.useSrcset,
                            props.scrollTarget,
                        )
                    ))
                ).subscribe(success => this.onLoad.emit(success));
            }

        });
    }

    ssrLazyLoadImage(element: any, imagePath: string, defaultImagePath: string, useSrcset: boolean = false, ssrImageLimitCount, useNoScript, imageDescription) {
        this.renderer.setAttribute(element, 'src', defaultImagePath);

        let firstNImages = Array.from(this.doc.body.getElementsByClassName(cssClassNames.applied)).slice(0, ssrImageLimitCount);

        if (this.isInFirstNImages(firstNImages, element)) {
            this.setImage(element, imagePath, useSrcset);
        } else {
            if (useNoScript) {
                this.addNoScriptTag(imagePath, imageDescription);
            }
        }
    }

    setImage(element: HTMLImageElement | HTMLDivElement, imagePath: string, useSrcset: boolean) {
        if (isImageElement(element)) {
            if (useSrcset) {
                element.srcset = imagePath;
            } else {
                element.src = imagePath;
            }
        } else {
            element.style.backgroundImage = `url('${imagePath}')`;
        }
        return element;
    }

    addNoScriptTag(imagePath, imageDescription) {
        let img = this.renderer.createElement('img');
        this.renderer.setAttribute(img, 'src', imagePath);
        this.renderer.setAttribute(img, 'alt', imageDescription);
        this.renderer.setAttribute(img, 'title', imageDescription);
        let noScript = this.renderer.createElement('noscript');
        this.renderer.appendChild(noScript, img);

        this.renderer.insertBefore(this.renderer.parentNode(this.elementRef.nativeElement), noScript, this.elementRef.nativeElement);
    }

    isInFirstNImages(firstNImages, element) {
        return firstNImages.find((img:HTMLImageElement) => {
            return img == element;
        });
    }

    static setDefaultConfig(config) {
        LazyLoadImageDirective._defaultConfig = Object.assign(config, LazyLoadImageDirective._defaultConfig);
    }

    ngOnDestroy() {
        [this.scrollSubscription]
            .filter(subscription => subscription && !subscription.isUnsubscribed)
            .forEach(subscription => subscription.unsubscribe());
    }
}
