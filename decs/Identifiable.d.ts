declare module "Identifiable" {
  interface Identifiable {
    hash: () => number;
    isEqual: (anything: object) => boolean;
  }
}
