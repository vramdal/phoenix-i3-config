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

    grid.addContainerForContent("some window", 1);
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

  it("should add a second window", () => {
    const grid = new Grid({ width: 5, height: 3 });
    grid.addContainerForContent("some window", 1);
    grid.calculateChanges();

    grid.addContainerForContent("some window", 2);
    const result = grid.calculateChanges();

    expect(result).toMatchInlineSnapshot(`
      Object {
        "modifiedContentPositions": Array [
          Object {
            "contentId": 1,
            "frame": Object {
              "height": 1,
              "width": 5,
              "x": 0,
              "y": 0,
            },
          },
        ],
        "newContentPositions": Array [
          Object {
            "contentId": 2,
            "frame": Object {
              "height": 1,
              "width": 5,
              "x": 0,
              "y": 1,
            },
          },
        ],
        "removedContentIds": Array [],
      }
    `);
  });

  it("should remove a window", () => {
    const grid = new Grid({ width: 5, height: 3 });
    grid.addContainerForContent("some window", 1);
    grid.addContainerForContent("some window", 2);
    grid.calculateChanges();

    grid.removeContainerForContent(1);
    const result = grid.calculateChanges();

    expect(result).toMatchInlineSnapshot(`
      Object {
        "modifiedContentPositions": Array [
          Object {
            "contentId": 2,
            "frame": Object {
              "height": 3,
              "width": 5,
              "x": 0,
              "y": 0,
            },
          },
        ],
        "newContentPositions": Array [],
        "removedContentIds": Array [
          "1",
        ],
      }
    `);
  });
});
