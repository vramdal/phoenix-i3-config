declare module "Screen" {
  import { Identifiable } from "Identifiable";
  import { Iterable } from "Iterable";
  import { Rectangle } from "Rectangle";
  import { Space } from "Space";
  import { Window } from "Window";

  class Screen implements Identifiable, Iterable {
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
}
