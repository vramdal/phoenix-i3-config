declare module "Timer" {
  import { Identifiable } from "Identifiable";

  class Timer implements Identifiable {
    static after: (interval: number, callback: () => void) => number;
    static every: (interval: number, callback: () => void) => number;
    static off: (identifier: number) => void;
    constructor(interval: number, repeats: number, callback: () => void);
    stop: () => void;
    hash(): number;
    isEqual(anything: object): boolean;
  }
}
