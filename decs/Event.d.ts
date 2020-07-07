declare module "Event" {
  import { Identifiable } from "Identifiable";

  class Event implements Identifiable {
    static on: (event: string, callback: () => void) => number;
    static once: (event: string, callback: () => void) => void;
    static off: (identifier: number) => void;
    name?: string;
    constructor(event: string, callback: () => void);
    disable: () => void;
    hash(): number;
    isEqual(anything: object): boolean;
  }
}
