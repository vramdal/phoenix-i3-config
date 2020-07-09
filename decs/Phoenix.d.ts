declare module "Phoenix" {
  export interface Identifiable {
    hash: () => number;
    isEqual: (anything: object) => boolean;
  }

  export interface Iterable {
    next: () => object;
    previous: () => object;
  }

  class Point {
    x: number;
    y: number;
  }

  export const reload: () => void;
  export const set: (preferences: { [key: string]: any }) => void;
  export const log: (...args: any[]) => void;
  export const notify: (message: string) => void;

  export class App implements Identifiable {
    static get: (appName: string) => App;
    static launch: (appName: string, optionals: { [key: string]: any }) => App;
    static focused: () => App;
    static all: () => App[];

    processIdentifier: () => number;
    bundleIdentifier: () => string;
    name: () => string;
    icon: () => Image;
    isActive: () => boolean;
    isHidden: () => boolean;
    isTerminated: () => boolean;
    mainWindow: () => Window;
    windows: (optionals?: { visible: boolean }) => Window[];
    activate: () => boolean;
    focus: () => boolean;
    show: () => boolean;
    hide: () => boolean;
    terminate: (optionals?: { force: boolean }) => boolean;
    hash(): number;
    isEqual(anything: object): boolean;
  }

  export class Event implements Identifiable {
    static on: (event: string, callback: () => void) => number;
    static once: (event: string, callback: () => void) => void;
    static off: (identifier: number) => void;
    name?: string;
    constructor(event: string, callback: () => void);
    disable: () => void;
    hash(): number;
    isEqual(anything: object): boolean;
  }

  export class Image implements Identifiable {
    static fromFile: (path: string) => Image;
    hash(): number;
    isEqual(anything: object): boolean;
  }

  export class Key implements Identifiable {
    static on: (
      key: string,
      modifiers: string[],
      callback: () => void
    ) => number;
    static once: (
      key: string,
      modifiers: string[],
      callback: () => void
    ) => void;
    static off: (identifier: number) => void;
    key: string;
    modifiers: string[];
    constructor(key: string, modifiers: string[], callback: () => void);
    isEnabled: () => boolean;
    enable: () => boolean;
    disable: () => boolean;
    hash(): number;
    isEqual(anything: object): boolean;
  }

  export class Modal {
    static build: (properties: { [key: string]: any }) => Modal;

    origin: Point;

    duration: number;
    animationDuration: number;
    weight: number;
    appearance: string;
    icon: Image;
    text: string;

    constructor();
    frame: () => Rectangle;
    show: () => void;
    close: () => void;
  }

  export class Mouse {
    static location: () => Point;
    static move: (point: Point) => boolean;
  }

  export class Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number);
  }

  export class Screen implements Identifiable, Iterable {
    static main: () => Screen;
    static all: () => Screen[];

    identifier: () => string;
    frame: () => Rectangle;
    visibleFrame: () => Rectangle;
    flippedFrame: () => Rectangle;
    flippedVisibleFrame: () => Rectangle;
    currentSpace: () => Space; // macOS 10.11+
    spaces: () => Space[]; // macOS 10.11+
    windows: (optionals: { [key: string]: any }) => Window[];
    hash(): number;
    isEqual(anything: object): boolean;
    next(): object;
    previous(): object;
  }

  export class Size {
    width: number;
    height: number;
  }

  export class Space implements Identifiable, Iterable {
    static active: () => Space; // macOS 10.11+
    static all: () => Space[]; // macOS 10.11+

    isNormal: () => boolean;
    isFullScreen: () => boolean;
    screens: () => Space[];
    windows: (optionals?: { visible: boolean }) => Window[];
    addWindows: (windows: Window[]) => void;
    removeWindows: (windows: Window[]) => void;
    hash(): number;
    isEqual(anything: object): boolean;
    next(): object;
    previous(): object;
  }

  export class Timer implements Identifiable {
    static after: (interval: number, callback: () => void) => number;
    static every: (interval: number, callback: () => void) => number;
    static off: (identifier: number) => void;
    constructor(interval: number, repeats: number, callback: () => void);
    stop: () => void;
    hash(): number;
    isEqual(anything: object): boolean;
  }

  export class Window implements Identifiable {
    static focused: () => Window;
    static at: (point: Point) => Window;
    static all: (optionals?: { [key: string]: any }) => Window[];
    static recent: () => Window[];

    others: (optionals: { [key: string]: any }) => Window[];
    title: () => string;
    isMain: () => boolean;
    isNormal: () => boolean;
    isFullScreen: () => boolean;
    isMinimised: () => boolean; // isMinimized: () => or
    isVisible: () => boolean;
    app: () => App;
    screen: () => Screen;
    spaces: () => Space[]; // macOS 10.11+
    topLeft: () => Point;
    size: () => Size;
    frame: () => Rectangle;
    setTopLeft: (point: Point) => boolean;
    setSize: (size: Size) => boolean;
    setFrame: (frame: Rectangle) => boolean;
    setFullScreen: (value: boolean) => boolean;
    maximise: () => boolean; // maximize: () => or
    minimise: () => boolean; // minimize: () => or
    unminimise: () => boolean; // unminimize: () => or
    neighbours: (direction: string) => Window[]; // neighbors: (...) => or
    raise: () => boolean;
    focus: () => boolean;
    focusClosestNeighbour: (direction: string) => boolean; // focusClosestNeighbor: (...) => or
    close: () => boolean;
    hash(): number;
    isEqual(anything: object): boolean;
  }

  export class Storage {
    static set: (key: string, value: any) => void;
    static get: (key: string) => any;
    static remove: (key: string) => void;
  }

  export class Task implements Identifiable {
    hash(): number;

    isEqual(anything: object): boolean;

    static run: (path: string, arguments: [], callback: () => void) => number;
    static terminate: (identifier: number) => void;

    status: number;
    output: string;
    error: string;

    constructor(path: string, arguments: [], callback: () => void);
    terminate: () => void;
  }
}
