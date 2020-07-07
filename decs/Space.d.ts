declare module "Space" {
  import { Identifiable } from "Identifiable";
  import { Iterable } from "Iterable";

  class Space implements Identifiable, Iterable {
    static active: () => Space; // macOS 10.11+
    static all: () => Space[]; // macOS 10.11+

    isNormal: () => boolean;
    isFullScreen: () => boolean;
    screens: () => Space[];
    windows: (optionals?: { visible: boolean }) => Window[]; // TODO
    addWindows: (windows: Window[]) => void;
    removeWindows: (windows: Window[]) => void;
    hash(): number;
    isEqual(anything: object): boolean;
    next(): object;
    previous(): object;
  }
}
