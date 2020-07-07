declare module "Modal" {
  import { Point } from "Point";
  import { Rectangle } from "Rectangle";
  import { Image } from "Image";

  class Modal {
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
}
