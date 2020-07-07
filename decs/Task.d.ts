declare module "Task" {
  import { Identifiable } from "Identifiable";

  class Task implements Identifiable {
    hash(): number;

    isEqual(anything: object): boolean;

    static run: (path: string, arguments: [], callback: () => void) => number;
    static terminate: (identifier: number) => void;

    status: number;
    output: string;
    error: string;

    constructor(path: string, arguments: [], callback: () => void);
    terminate: () => void;
  }
}
