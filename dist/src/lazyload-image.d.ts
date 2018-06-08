import { Observable } from 'rxjs/Observable';
import "rxjs/add/observable/of";
export declare function isVisible(element: HTMLElement, threshold: number, _window: Window, scrollContainer?: HTMLElement): boolean;
export declare function isChildOfPicture(element: HTMLImageElement | HTMLDivElement): boolean;
export declare function isImageElement(element: HTMLImageElement | HTMLDivElement): element is HTMLImageElement;
export declare function lazyLoadImage(element: HTMLImageElement | HTMLDivElement, imagePath: string, defaultImagePath: string, errorImgPath: string, offset: number, useSrcset?: boolean, scrollContainer?: HTMLElement): (scrollObservable: Observable<Event>) => Observable<boolean>;
