import _ from "lodash";
import { EventSetup, EventListener } from "../EventSetup";

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
  children: Item[] = [];
  orientation: "VERTICAL" | "HORIZONTAL";

  addChild(child: Item): void {
    this.children.push(child);
  }

  removeDescendant(childToRemove: Item): boolean {
    for (const child of this.children) {
      if (child === childToRemove) {
        remove(this.children, child);
        return true;
      }
      if (
        child instanceof SplitContainer &&
        child.removeDescendant(childToRemove)
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
      return child.render({
        ...absoluteFrame,
        x: absoluteFrame.x + offset,
        width,
      });
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
      return child.render({
        ...absoluteFrame,
        y: absoluteFrame.y + offset,
        height,
      });
    });
    return flatten(arrayOfArrays);
  }
}

interface RenderResult {
  frame: Rectangle;
}

export interface ContentRenderResult extends RenderResult {
  contentId: number;
}

const isContentRenderResult = (
  renderResult: RenderResult
): renderResult is ContentRenderResult => {
  return renderResult.hasOwnProperty("contentId");
};

class Content {
  contentId: number;
  private content: any;

  constructor(content: any, contentId: number) {
    this.contentId = contentId;
    this.content = content;
  }

  render(absoluteFrame: Rectangle): ContentRenderResult[] {
    return [{ frame: absoluteFrame, contentId: this.contentId }];
  }

  getContent() {
    return this.content;
  }
}

type Item = Content | Container;

type ContentRenderResultMap = { [contentId: number]: ContentRenderResult };
type ContentContainerMap = { [contentId: number]: Content };

export type PendingWindowOperations = {
  removedContentIds: string[];
  modifiedContentPositions: ContentRenderResult[];
  newContentPositions: any[];
};

export class Grid {
  // Her er ne
  private rootContainer: HorizontalSplitContainer;
  private acceptingContainer: SplitContainer;
  private frame: Rectangle;
  // tslint:disable-next-line
  private logger: (...args: any[]) => void = () => {};
  private contentState: ContentRenderResultMap = {};
  private contentContainerMap: ContentContainerMap = {};
  private dirty = false;

  private contentResizeNeededEvent = new EventSetup<PendingWindowOperations>(
    "contentResizeNeeded"
  );
  // private contentIds: number[];

  constructor(
    size: Size,
    logger: (...args: any[]) => void = () => {
      /* NOOP */
    }
  ) {
    this.logger = logger;
    this.logger("Lager grid");
    this.frame = { ...size, x: 0, y: 0 };
    this.rootContainer = new HorizontalSplitContainer();
    this.acceptingContainer = this.rootContainer;
  }

  addContainerForContent(content: any, contentId: number): void {
    if (this.contentContainerMap.hasOwnProperty(contentId)) {
      this.logger(`Content already in grid (${contentId})`);
    }
    const contentContainer = new Content(content, contentId);
    this.contentContainerMap[contentId] = contentContainer;
    this.logger(`Adding content (${contentId})`);
    this.acceptingContainer.addChild(contentContainer);
    this.dirty = true;
  }

  removeContainerForContent(contentId: number): void {
    const container = this.contentContainerMap[contentId];
    if (container) {
      this.logger(`Removing container for content (${contentId})`);
      this.rootContainer.removeDescendant(container);
      this.dirty = true;
    } else {
      this.logger(`Already removed content (${contentId})`);
    }
  }

  onContentResizeNeeded(handler: EventListener<PendingWindowOperations>) {
    this.contentResizeNeededEvent.addListener(handler);
  }

  getContentById(contentId: number): any {
    return this.contentContainerMap[contentId].getContent();
  }

  calculateChanges(): PendingWindowOperations {
    if (!this.dirty) {
      return {
        newContentPositions: [],
        removedContentIds: [],
        modifiedContentPositions: [],
      };
    }
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

    const result = {
      newContentPositions,
      removedContentIds,
      modifiedContentPositions,
    };
    // Phoenix.log("result: " + result);
    this.dirty = false;
    this.contentResizeNeededEvent.fire(result);
    return result;
  }
}
