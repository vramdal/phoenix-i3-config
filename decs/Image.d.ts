declare module "Image" {
  import { Identifiable } from "Identifiable";

  class Image implements Identifiable {
    static fromFile: (path: string) => Image;
    hash(): number;
    isEqual(anything: object): boolean;
  }
}
