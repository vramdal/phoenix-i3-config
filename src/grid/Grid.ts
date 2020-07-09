import _ from "lodash";

const flatten = _.flatten;
const difference = _.difference;
const keyBy = _.keyBy;
const isEqual = _.isEqual;
const remove = _.remove;

interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

let containerCounter = 0;

interface Rectangle extends Point, Size {}

abstract class Container {
  private containerId;

  constructor() {
    this.containerId = `container-${containerCounter++}`;
  }

  abstract render(absoluteFrame: Rectangle): RenderResult[];
}

/*
class EmptyContainer extends Container {
  render(absoluteFrame: Rectangle): RenderResult[] {
    return [{ frame: absoluteFrame }];
    // return Image.fromFile("../assets/empty-window.svg");
  }
}
*/

abstract class SplitContainer extends Container {
  children: Container[] = [];
  orientation: "VERTICAL" | "HORIZONTAL";

  addChild(container: Container): void {
    this.children.push(container);
  }

  removeDescendant(container: Container): boolean {
    for (const child of this.children) {
      if (child === container) {
        remove(this.children, child);
        return true;
      }
      if (
        child instanceof SplitContainer &&
        child.removeDescendant(container)
      ) {
        return true;
      }
    }
    return false;
  }
}

// noinspection JSUnusedLocalSymbols
class VerticalSplitContainer extends SplitContainer {
  orientation: "VERTICAL";

  render(absoluteFrame: Rectangle): RenderResult[] {
    const size = { width: absoluteFrame.width, height: absoluteFrame.height };
    const width = Math.floor(size.width / this.children.length);
    const arrayOfArrays = this.children.map((child, idx) => {
      const offset = width * idx;
      return child.render({ x: absoluteFrame.x + offset, ...absoluteFrame });
    });
    return flatten(arrayOfArrays);
  }
}

class HorizontalSplitContainer extends SplitContainer {
  orientation: "HORIZONTAL";

  render(absoluteFrame: Rectangle): RenderResult[] {
    const size = { width: absoluteFrame.width, height: absoluteFrame.height };
    const height = Math.floor(size.height / this.children.length);
    const arrayOfArrays = this.children.map((child, idx) => {
      const offset = height * idx;
      return child.render({ y: absoluteFrame.y + offset, ...absoluteFrame });
    });
    return flatten(arrayOfArrays);
  }
}

interface RenderResult {
  frame: Rectangle;
}

interface ContentRenderResult extends RenderResult {
  contentId: number;
}

const isContentRenderResult = (
  renderResult: RenderResult
): renderResult is ContentRenderResult => {
  return renderResult.hasOwnProperty("contentId");
};

class ContentContainer extends Container {
  contentId: number;

  constructor(content: any, contentId: number) {
    super();
    this.contentId = contentId;
  }

  render(absoluteFrame: Rectangle): ContentRenderResult[] {
    return [{ frame: absoluteFrame, contentId: this.contentId }];
  }
}

type ContentRenderResultMap = { [contentId: number]: ContentRenderResult };
type ContentContainerMap = { [contentId: number]: Container };

export class Grid {
  // Her er ne
  private rootContainer: HorizontalSplitContainer;
  private frame: Rectangle;
  private contentState: ContentRenderResultMap = {};
  private contentContainerMap: ContentContainerMap = {};
  // private contentIds: number[];

  constructor(size: Size) {
    Phoenix.log("Lager grid");
    this.frame = { ...size, x: 0, y: 0 };
    this.rootContainer = new HorizontalSplitContainer();
  }

  onNewWindow(content: any, contentId: number): void {
    const contentContainer = new ContentContainer(content, contentId);
    this.contentContainerMap[contentId] = contentContainer;
    Phoenix.log("Adding window", contentId, "Laks");
    this.rootContainer.addChild(contentContainer);
  }

  onWindowRemoved(contentId: number): void {
    const container = this.contentContainerMap[contentId];
    this.rootContainer.removeDescendant(container);
  }

  calculateChanges() {
    const newContentState: ContentRenderResultMap = keyBy(
      this.rootContainer.render(this.frame).filter(isContentRenderResult),
      (contentRenderResult) => contentRenderResult.contentId
    );

    const contentIds = Object.keys(newContentState);
    const existingContentIds = Object.keys(this.contentState);
    const newContentIds: string[] = difference(contentIds, existingContentIds);
    const removedContentIds: string[] = difference(
      existingContentIds,
      contentIds
    );
    const modifiedContentIds = Object.keys(this.contentState)
      .filter((contentId) => newContentState.hasOwnProperty(contentId))
      .filter(
        (contentId) =>
          !isEqual(this.contentState[contentId], newContentState[contentId])
      );
    this.contentState = newContentState;

    const newContentPositions = newContentIds.map(
      (contentId) => this.contentState[contentId]
    );
    const modifiedContentPositions = modifiedContentIds.map(
      (contentId) => this.contentState[contentId]
    );

    return { newContentPositions, removedContentIds, modifiedContentPositions };
  }
}
