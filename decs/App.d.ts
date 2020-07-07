declare module "App" {
  import { Identifiable } from "Identifiable";
  import { Image } from "Image";
  import { Window } from "Window";

  class App implements Identifiable {
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
}
