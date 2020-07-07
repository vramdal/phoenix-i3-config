declare module "Storage" {
  class Storage {
    static set: (key: string, value: any) => void;
    static get: (key: string) => any;
    static remove: (key: string) => void;
  }
}
