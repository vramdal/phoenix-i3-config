declare module "Iterable" {
  interface Iterable {
    next: () => object;
    previous: () => object;
  }
}
