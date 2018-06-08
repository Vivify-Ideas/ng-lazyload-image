import { AfterContentInit, ElementRef, EventEmitter, NgZone, OnChanges, OnDestroy, SimpleChanges, Renderer2 } from '@angular/core';
export declare class LazyLoadImageDirective implements OnChanges, AfterContentInit, OnDestroy {
    private renderer;
    lazyImage: any;
    defaultImage: string;
    errorImage: string;
    scrollTarget: any;
    scrollObservable: any;
    offset: number;
    useSrcset: boolean;
    ssrImageLimitCount: number;
    onLoad: EventEmitter<boolean>;
    private propertyChanges$;
    private elementRef;
    private ngZone;
    private scrollSubscription;
    private static _defaultConfig;
    private doc;
    constructor(el: ElementRef, ngZone: NgZone, renderer: Renderer2, document: any);
    ngOnChanges(changes?: SimpleChanges): void;
    ngAfterContentInit(): void;
    ssrLazyLoadImage(element: any, imagePath: string, defaultImagePath: string, useSrcset: boolean, ssrImageLimitCount: any): void;
    setImage(element: HTMLImageElement | HTMLDivElement, imagePath: string, useSrcset: boolean): HTMLImageElement | HTMLDivElement;
    isInFirstNImages(firstNImages: any, element: any): any;
    static setDefaultConfig(config: any): void;
    ngOnDestroy(): void;
}
