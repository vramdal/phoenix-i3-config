import { Direction, Grid } from "./Grid";

describe("Grid", () => {
  const onContentResizeNeededHandler = jest.fn();
  let grid: Grid<string>;

  beforeEach(() => {
    jest.resetAllMocks();
    grid = new Grid({ width: 5, height: 3, x: 0, y: 0 });
    grid.onContentResizeNeeded(onContentResizeNeededHandler);
  });

  it("should report no changes", () => {
    grid.calculateChanges();

    expect(onContentResizeNeededHandler).not.toHaveBeenCalled();
  });

  it("should add a window", () => {
    grid.addContainerForContent("some window", 1);
    grid.calculateChanges();

    expect(onContentResizeNeededHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        modifiedContentPositions: [],
        newContentPositions: [
          {
            contentId: 1,
            frame: {
              height: 3,
              width: 5,
              x: 0,
              y: 0,
            },
          },
        ],
        removedContentIds: [],
      })
    );
    expect(grid.toString()).toMatchInlineSnapshot(`
      "Grid
      -SplitContainer (HORIZONTAL)
      --Content (id 1)"
    `);
    expect(grid.getFocusedNode()).toMatchObject({
      containerId: "container-1",
      parent: null,
    });
  });

  it("should add a second window", () => {
    grid.addContainerForContent("some window", 1);
    grid.calculateChanges();

    grid.addContainerForContent("some window", 2);
    grid.calculateChanges();

    expect(onContentResizeNeededHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        modifiedContentPositions: [
          {
            contentId: 1,
            frame: {
              height: 1,
              width: 5,
              x: 0,
              y: 0,
            },
          },
        ],
        newContentPositions: [
          {
            contentId: 2,
            frame: {
              height: 1,
              width: 5,
              x: 0,
              y: 1,
            },
          },
        ],
        removedContentIds: [],
      })
    );
    expect(grid.toString()).toMatchInlineSnapshot(`
      "Grid
      -SplitContainer (HORIZONTAL)
      --Content (id 1)
      --Content (id 2)"
    `);
  });

  it("should remove a window", () => {
    grid.addContainerForContent("some window", 1);
    grid.addContainerForContent("some window", 2);
    grid.calculateChanges();

    grid.removeContainerForContent(1);
    grid.calculateChanges();

    expect(onContentResizeNeededHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        modifiedContentPositions: [
          {
            contentId: 2,
            frame: {
              height: 3,
              width: 5,
              x: 0,
              y: 0,
            },
          },
        ],
        newContentPositions: [],
        removedContentIds: ["1"],
      })
    );
    expect(grid.toString()).toMatchInlineSnapshot(`
      "Grid
      -SplitContainer (HORIZONTAL)
      --Content (id 2)"
    `);
  });

  describe("focus", () => {
    const focusMovedEventHandler = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
      grid.onFocusMoved(focusMovedEventHandler);
    });

    it("should move focus to next node", () => {
      const window1 = grid.addContainerForContent("window 1", 1);
      const window2 = grid.addContainerForContent("window 2", 2);
      grid.setFocus(window1);

      grid.moveFocus(Direction.SOUTH);

      expect(grid.getFocusedNode()).toBe(window2);
      expect(focusMovedEventHandler).toHaveBeenCalledWith(window2);
    });

    it("should move focus to previous node", () => {
      const window1 = grid.addContainerForContent("window 1", 1);
      const window2 = grid.addContainerForContent("window 2", 2);
      grid.setFocus(window2);

      grid.moveFocus(Direction.NORTH);

      expect(grid.getFocusedNode()).toBe(window1);
      expect(focusMovedEventHandler).toHaveBeenCalledWith(window1);
    });

    it("should move focus to parent node", () => {
      const window1 = grid.addContainerForContent("window 1", 1);
      grid.setFocus(window1);

      grid.moveFocus(Direction.UP);

      expect(grid.getFocusedNode()).toBe(grid.getRootContainer());
      expect(focusMovedEventHandler).toHaveBeenCalledWith(
        grid.getRootContainer()
      );
    });

    it("should move focus to first child", () => {
      const window1 = grid.addContainerForContent("window 1", 1);
      grid.addContainerForContent("window 2", 2);
      // Focus is on root container

      grid.moveFocus(Direction.DOWN);

      expect(grid.getFocusedNode()).toBe(window1);
      expect(focusMovedEventHandler).toHaveBeenCalledWith(window1);
    });
  });

  describe("move nodes", () => {
    const contentResizeNeededHandler = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
      grid.onContentResizeNeeded(contentResizeNeededHandler);
    });

    it("should move a node backward", () => {
      grid.addContainerForContent("window 1", 1);
      const window2 = grid.addContainerForContent("window 2", 2);
      grid.setFocus(window2);
      grid.calculateChanges();

      grid.moveNode(Direction.NORTH);
      grid.calculateChanges();

      expect(contentResizeNeededHandler).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          modifiedContentPositions: expect.arrayContaining([
            { contentId: 1, frame: { height: 1, width: 5, x: 0, y: 1 } },
            { contentId: 2, frame: { height: 1, width: 5, x: 0, y: 0 } },
          ]),
          newContentPositions: [],
          removedContentIds: [],
        })
      );
      expect(grid.toString()).toMatchInlineSnapshot(`
        "Grid
        -SplitContainer (HORIZONTAL)
        --Content (id 2)
        --Content (id 1)"
      `);
    });
    it("should move a node forward", () => {
      const window1 = grid.addContainerForContent("window 1", 1);
      grid.addContainerForContent("window 2", 2);
      grid.setFocus(window1);
      grid.calculateChanges();

      grid.moveNode(Direction.SOUTH);
      grid.calculateChanges();

      expect(contentResizeNeededHandler).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          modifiedContentPositions: expect.arrayContaining([
            { contentId: 1, frame: { height: 1, width: 5, x: 0, y: 1 } },
            { contentId: 2, frame: { height: 1, width: 5, x: 0, y: 0 } },
          ]),
          newContentPositions: [],
          removedContentIds: [],
        })
      );
      expect(grid.toString()).toMatchInlineSnapshot(`
        "Grid
        -SplitContainer (HORIZONTAL)
        --Content (id 2)
        --Content (id 1)"
      `);
    });
  });
});
