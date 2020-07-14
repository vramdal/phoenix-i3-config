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

interface GridNode {
  toString(indent?: string): string;
  render(absoluteFrame: Rectangle): RenderResult[];
  getParent(): Container | null;
  getChildren(): GridNode[];
}

export abstract class Container implements GridNode {
  private containerId;
  private parent: Container | null;

  constructor(parent: Container) {
    this.containerId = `container-${containerCounter++}`;
    this.parent = parent;
  }

  abstract render(absoluteFrame: Rectangle): RenderResult[];

  abstract toString(indent?: string): string;

  getParent(): Container | null {
    return this.parent;
  }

  abstract getChildren(): GridNode[];

  abstract reOrderChild(childToMove: GridNode, position: number): void;
}

/*
class EmptyContainer extends Container {
  render(absoluteFrame: Rectangle): RenderResult[] {
    return [{ frame: absoluteFrame }];
    // return Image.fromFile("../assets/empty-window.svg");
  }
}
*/

export enum Orientation {
  VERTICAL = "VERTICAL",
  HORIZONTAL = "HORIZONTAL",
}

export enum Direction {
  NORTH = "NORTH",
  SOUTH = "SOUTH",
  WEST = "WEST",
  EAST = "EAST",
  UP = "UP",
  DOWN = "DOWN",
}

const swapPositions = <T>(originalArray: T[], a: number, b: number) => {
  const array = [...originalArray];
  [array[a], array[b]] = [array[b], array[a]];
  return array;
};
abstract class SplitContainer extends Container {
  children: GridNode[] = [];
  orientation: Orientation;

  addChild(child: GridNode): void {
    this.children.push(child);
  }

  getChildren(): GridNode[] {
    return this.children;
  }

  reOrderChild(childToMove: GridNode, position: number): boolean {
    const originalChildren = this.children;
    const childIndex = this.children.findIndex(
      (child) => child === childToMove
    );
    if (
      childIndex + position >= 0 &&
      childIndex + position <= this.children.length - 1
    )
      this.children = swapPositions(
        this.children,
        childIndex,
        childIndex + position
      );
    return originalChildren !== this.children;
  }

  removeDescendant(childToRemove: GridNode): boolean {
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

  toString(indent: string = ""): string {
    return (
      `${indent}SplitContainer (${this.orientation})\n` +
      `${this.children
        .map((child) => `${child.toString(`${indent}-`)}`)
        .join("\n")}`
    );
  }
}

// noinspection JSUnusedLocalSymbols
class VerticalSplitContainer extends SplitContainer {
  orientation = Orientation.VERTICAL;

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
  orientation = Orientation.HORIZONTAL;

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

export class Content<ContentType> implements GridNode {
  contentId: number;
  private content: ContentType;
  private parent: Container;

  constructor(content: any, contentId: number, parent: Container) {
    this.contentId = contentId;
    this.content = content;
    this.parent = parent;
  }

  render(absoluteFrame: Rectangle): ContentRenderResult[] {
    return [{ frame: absoluteFrame, contentId: this.contentId }];
  }

  getContent(): ContentType {
    return this.content;
  }

  getChildren(): GridNode[] {
    return [];
  }

  toString(indent?: string) {
    return `${indent}Content (id ${this.contentId})`;
  }

  getParent(): Container | null {
    return this.parent;
  }
}

type ContentRenderResultMap = { [contentId: number]: ContentRenderResult };
type ContentContainerMap<ContentType> = {
  [contentId: number]: Content<ContentType>;
};

export type PendingWindowOperations = {
  removedContentIds: string[];
  modifiedContentPositions: ContentRenderResult[];
  newContentPositions: any[];
};

export class Grid<ContentType> {
  // Her er ne
  private rootContainer: HorizontalSplitContainer;
  private acceptingContainer: SplitContainer;
  private focusedNode: GridNode;
  private frame: Rectangle;
  // tslint:disable-next-line
  private logger: (...args: any[]) => void = () => {};
  private contentState: ContentRenderResultMap = {};
  private contentContainerMap: ContentContainerMap<ContentType> = {};
  private dirty = false;

  private contentResizeNeededEvent = new EventSetup<PendingWindowOperations>(
    "contentResizeNeeded"
  );
  private focusMovedEvent = new EventSetup<GridNode>("focusMoved");
  // private contentIds: number[];

  constructor(
    frame: Rectangle,
    logger: (...args: any[]) => void = () => {
      /* NOOP */
    }
  ) {
    this.logger = logger;
    this.logger("Lager grid");
    this.frame = frame;
    this.rootContainer = new HorizontalSplitContainer(null);
    this.acceptingContainer = this.rootContainer;
    this.focusedNode = this.rootContainer;
  }

  addContainerForContent(content: ContentType, contentId: number): GridNode {
    if (this.contentContainerMap.hasOwnProperty(contentId)) {
      this.logger(`Content already in grid (${contentId})`);
    }
    const contentContainer = new Content<ContentType>(
      content,
      contentId,
      this.acceptingContainer
    );
    this.contentContainerMap[contentId] = contentContainer;
    this.logger(`Adding content (${contentId})`);
    this.acceptingContainer.addChild(contentContainer);
    this.dirty = true;
    return contentContainer;
  }

  getRootContainer(): Container {
    return this.rootContainer;
  }

  removeContainerForContent(contentId: number): void {
    const container = this.contentContainerMap[contentId];
    if (container) {
      this.logger(`Removing container for content (${contentId})`);
      this.rootContainer.removeDescendant(container);
      this.dirty = true;
      // } else {
      //   this.logger(`Already removed content (${contentId})`);
    }
  }

  onContentResizeNeeded(handler: EventListener<PendingWindowOperations>) {
    this.contentResizeNeededEvent.addListener(handler);
  }

  onFocusMoved(handler: EventListener<GridNode>) {
    this.focusMovedEvent.addListener(handler);
  }

  getContentById(contentId: number): ContentType | undefined {
    return this.contentContainerMap[contentId].getContent();
  }

  getFocusedNode(): GridNode {
    return this.focusedNode;
  }

  setFocus(nodeOrContentId: GridNode | number) {
    if (!nodeOrContentId) {
      return;
    }
    if ("getParent" in (nodeOrContentId as any)) {
      this.focusedNode = nodeOrContentId as GridNode;
      this.focusMovedEvent.fire(this.focusedNode);
    } else {
      const node = this.contentContainerMap[nodeOrContentId as number];
      if (node) {
        this.setFocus(node);
      }
    }
  }

  moveFocus(direction: Direction) {
    const parentContainer: Container = this.focusedNode.getParent();
    let delta = 0;
    const previouslyFocusedNode = this.focusedNode;
    if (parentContainer instanceof SplitContainer) {
      if (direction === Direction.UP) {
        this.focusedNode = this.focusedNode.getParent() || this.focusedNode;
      } else if (
        parentContainer.orientation === Orientation.HORIZONTAL &&
        direction !== Direction.NORTH &&
        direction !== Direction.SOUTH
      ) {
        return; // TODO
      } else if (
        parentContainer.orientation === Orientation.VERTICAL &&
        direction !== Direction.EAST &&
        direction !== Direction.WEST
      ) {
        return; // TODO
      } else {
        const children = parentContainer.getChildren();
        delta =
          direction === Direction.EAST || direction === Direction.SOUTH
            ? 1
            : -1;
        const childIndex = children.findIndex(
          (child) => child === this.focusedNode
        );
        const newFocusedChildIndex = childIndex + delta;
        if (
          newFocusedChildIndex >= 0 &&
          newFocusedChildIndex <= children.length - 1
        ) {
          this.focusedNode = children[newFocusedChildIndex];
        }
      }
    } else if (direction === Direction.DOWN) {
      const children = this.focusedNode.getChildren();
      this.focusedNode =
        (children.length > 0 && children[0]) || this.focusedNode;
    }
    if (previouslyFocusedNode !== this.focusedNode) {
      this.focusMovedEvent.fire(this.focusedNode);
    }
  }

  moveNode(direction: Direction) {
    const focusParent = this.focusedNode.getParent();
    this.logger("Flytter node " + direction);
    if (focusParent instanceof SplitContainer) {
      if (
        (focusParent.orientation === Orientation.HORIZONTAL &&
          (direction === Direction.NORTH || direction === Direction.SOUTH)) ||
        (focusParent.orientation === Orientation.VERTICAL &&
          (direction === Direction.WEST || direction === Direction.EAST))
      ) {
        const delta =
          direction === Direction.NORTH || direction === Direction.WEST
            ? -1
            : 1;
        const modified = focusParent.reOrderChild(this.focusedNode, delta);
        if (modified) {
          this.dirty = true;
        }
      }
    }
  }

  toString() {
    return `Grid
${this.rootContainer.toString("-")}`;
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
