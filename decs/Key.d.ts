declare module "Key" {
  import { Identifiable } from "Identifiable";

  class Key implements Identifiable {
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
}
