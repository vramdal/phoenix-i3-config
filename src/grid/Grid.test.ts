import { Grid } from "./Grid";

describe("Grid", () => {
  it("should report no changes", () => {
    const grid = new Grid({ width: 5, height: 3 });

    const result = grid.calculateChanges();

    expect(result).toMatchInlineSnapshot(`
      Object {
        "modifiedContentPositions": Array [],
        "newContentPositions": Array [],
        "removedContentIds": Array [],
      }
    `);
  });

  it("should add a window", () => {
    const grid = new Grid({ width: 5, height: 3 });

    grid.onNewWindow("some window", 1);
    const result = grid.calculateChanges();

    expect(result).toMatchInlineSnapshot(`
      Object {
        "modifiedContentPositions": Array [],
        "newContentPositions": Array [
          Object {
            "contentId": 1,
            "frame": Object {
              "height": 3,
              "width": 5,
              "x": 0,
              "y": 0,
            },
          },
        ],
        "removedContentIds": Array [],
      }
    `);
  });

  it("should remove a window", () => {
    const grid = new Grid({ width: 5, height: 3 });
    grid.onNewWindow("some window", 1);
    grid.onNewWindow("some window", 2);
    grid.calculateChanges();

    grid.onWindowRemoved(1);
    const result = grid.calculateChanges();

    expect(result).toMatchInlineSnapshot(`
      Object {
        "modifiedContentPositions": Array [],
        "newContentPositions": Array [],
        "removedContentIds": Array [
          "1",
        ],
      }
    `);
  });
});
