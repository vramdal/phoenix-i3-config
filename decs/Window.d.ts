declare module "Window" {
  import { Identifiable } from "Identifiable";
  import { App } from "App";
  import { Point } from "Point";
  import { Space } from "Space";
  import { Size } from "Size";
  import { Rectangle } from "Rectangle";

  class Window implements Identifiable {
    static focused: () => Window;
    static at: (point: Point) => Window;
    static all: (optionals: { [key: string]: any }) => Window[];
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
}
