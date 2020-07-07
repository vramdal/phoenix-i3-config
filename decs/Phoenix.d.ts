declare module "phoenix" {
  class Phoenix {
    static reload: () => void;
    static set: (preferences: Map<string, any>) => void;
    static log: (args: any[]) => void;
    static notify: (message: string) => void;
  }
}
