import { Grid } from "./Grid";

describe("Grid", () => {
  const onContentResizeNeededHandler = jest.fn();
  let grid: Grid;

  beforeEach(() => {
    jest.resetAllMocks();
    grid = new Grid({ width: 5, height: 3 });
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
  });
});
