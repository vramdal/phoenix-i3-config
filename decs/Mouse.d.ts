declare module "Mouse" {
  import { Point } from "Point";

  class Mouse {
    static location: () => Point;
    static move: (point: Point) => boolean;
  }
}
