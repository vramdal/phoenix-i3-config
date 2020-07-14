// import "./contants.js";
// import "./keys/movement.js";
// import "./keys/focus.js";
// import "./keys/info.js";

// import Phoenix, { Screen, Window, Storage } from "global";
// import { Key } from "Key";
import { Content, Direction, Grid, PendingWindowOperations } from "./grid/Grid";
// import leftpad from "leftpad";

// eval("Phoenix.log('Her logges det', JSON.stringify(Key))");

Phoenix.set({
  openAtLogin: true,
});

const MODIFIERS = ["ctrl", "alt"];

// @ts-ignore
const mainScreenFrame = Screen.main().flippedFrame();

Phoenix.log("New grid at " + JSON.stringify(mainScreenFrame));

const grid = new Grid<PhoenixWindow>(mainScreenFrame, (...args: any) =>
  Phoenix.log(...args)
);

Timer.every(0.2, () => {
  grid.calculateChanges();
  // @ts-ignore
  const focusedWindow = Window.focused();
  // Phoenix.log(
  //   "Fokus på " + focusedWindow.title() + "(" + focusedWindow.hash() + ")"
  // );
  grid.setFocus(focusedWindow && focusedWindow.hash());
});

grid.onContentResizeNeeded((operations: PendingWindowOperations) => {
  Phoenix.log(
    "Operasjoner: " +
      operations.modifiedContentPositions.length +
      operations.newContentPositions.length
  );
  for (const modifiedContentPosition of operations.modifiedContentPositions) {
    const win: PhoenixWindow = grid.getContentById(
      modifiedContentPosition.contentId
    );
    Phoenix.log(
      "Flytter vindu " +
        win.title() +
        " til " +
        JSON.stringify(modifiedContentPosition)
    );
    win.setFrame(modifiedContentPosition.frame);
    const modal = Modal.build({
      origin: {
        x: modifiedContentPosition.frame.x,
        y: modifiedContentPosition.frame.y,
      },
      duration: 2,
      animationDuration: 0.5,
      appearance: "light",
      text: "Added window to grid",
    });
    modal.show();
  }
  for (const newContentPosition of operations.newContentPositions) {
    const win = grid.getContentById(newContentPosition.contentId);
    win.setFrame(newContentPosition.frame);
  }
});

grid.onFocusMoved((focusNode) => {
  Phoenix.log("Focus moved to " + focusNode.toString());
  const modal = Modal.build({
    origin: {
      x: 0,
      y: 0,
    },
    duration: 2,
    animationDuration: 0.5,
    appearance: "light",
    text: "Focus on " + focusNode.toString(),
  });
  modal.show();
  if (focusNode instanceof Content) {
    focusNode.getContent().focus();
  }
});

// @ts-ignore
Event.on("windowDidOpen", (window) => {
  if (window.isNormal()) {
    Phoenix.notify(
      "Nytt vindu: " +
        window.title() +
        " isNormal? " +
        (window.isNormal() ? "true" : "false")
    );
  }
});

// @ts-ignore
Event.on("windowDidClose", (window) => {
  grid.removeContainerForContent(window.hash());
  if (window.isNormal()) {
    const app: App = window.app();

    Phoenix.notify(
      "Vindu lukket" +
        window.title() +
        "(" +
        app.name() +
        ")" +
        " isNormal? " +
        (window.isNormal() ? "true" : "false")
    );
  }
});

// @ts-ignore
Event.on("appDidLaunch", (app: App) => {
  Phoenix.notify("appDidLaunch: " + app.name());
});

// @ts-ignore
Event.on("windowDidResize", () => {
  // @ts-ignore
  // Phoenix.notify("windowDidResize: " + window.title());
});

// @ts-ignore
Key.on("g", MODIFIERS, () => {
  // @ts-ignore
  const window: Window = Window.focused();
  // const str = leftpad("abc");
  // const a = str + "b";
  // @ts-ignore
  grid.addContainerForContent(window, window.hash());
});

Key.on("j", MODIFIERS, () => {
  grid.moveFocus(Direction.WEST);
});
Key.on("k", MODIFIERS, () => {
  Phoenix.log("Focus north");
  grid.moveFocus(Direction.NORTH);
});
Key.on("l", MODIFIERS, () => {
  grid.moveFocus(Direction.SOUTH);
});
Key.on("ø", MODIFIERS, () => {
  grid.moveFocus(Direction.EAST);
});
Key.on("h", MODIFIERS, () => {
  grid.moveFocus(Direction.DOWN);
});
Key.on("æ", MODIFIERS, () => {
  grid.moveFocus(Direction.UP);
});
Key.on("left", MODIFIERS, () => {
  grid.moveNode(Direction.WEST);
});
Key.on("up", MODIFIERS, () => {
  grid.moveNode(Direction.NORTH);
});
Key.on("down", MODIFIERS, () => {
  grid.moveNode(Direction.SOUTH);
});
Key.on("right", MODIFIERS, () => {
  grid.moveNode(Direction.EAST);
});

/*
Key.on("z", MODIFIERS, () => {
  const screen = Screen.main().flippedVisibleFrame();
  const window = Window.focused();

  if (window) {
    window.setTopLeft({
      x: screen.x + screen.width / 2 - window.frame().width / 2,
      y: screen.y + screen.height / 2 - window.frame().height / 2,
    });
  }
});

const windowIsMaximised = (window) => !!Storage.get(getWindowId(window));

const getWindowId = (window) => "window-" + window.hash();

Key.on("m", MODIFIERS, () => {
  const window = Window.focused();

  if (window) {
    const windowId = getWindowId(window);
    if (!windowIsMaximised(window)) {
      const before = window.frame();
      const success = window.maximise();
      const after = window.frame();
      if (
        !(
          before.x === after.x &&
          before.y === after.y &&
          before.width === after.width &&
          before.height === after.height
        )
      ) {
        Storage.set(windowId, before);
      }
    } else {
      const savedFrame = Storage.get(windowId);
      if (savedFrame) {
        window.setFrame(savedFrame);
        Storage.remove(windowId);
      }
    }
  }
});

function focusClosestNeighbour(key) {
  const directions = {
    left: "west",
    up: "north",
    down: "south",
    right: "east",
  };
  return () => {
    const window = Window.focused();
    const direction = directions[key];
    if (window) {
      const rectangle = window.frame();
      const point: { x?: number; y?: number } = {};
      if (direction === "west") {
        point.x = rectangle.x - 5;
        point.y = rectangle.y;
      } else if (direction === "east") {
        point.x = rectangle.x + rectangle.width + 5;
        point.y = rectangle.y + rectangle.y;
      } else if (direction === "north") {
        point.x = rectangle.x;
        point.y = rectangle.y - 5;
      } else if (direction === "south") {
        point.x = rectangle.x;
        point.y = rectangle.y + rectangle.height + 5;
      }
      const neighbours = window.neighbours(direction);
      const neighbourNames = neighbours.map((neighbor) => neighbor.title());
      Phoenix.log(
        "Direction",
        direction,
        "neighbourNames",
        JSON.stringify(neighbourNames)
      );
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < neighbours.length; i++) {
        const neighbour = neighbours[i];
        if (neighbour.isVisible()) {
          neighbour.focus();
          break;
        }
      }
    }
  };
}

function withFocusedWindow(wrapped) {
  const window = Window.focused();
  if (window) {
    wrapped(window, Array.prototype.slice.call(arguments, 1));
  }
}

function setBookmark(key) {
  return () => {
    withFocusedWindow((window) => {
      Phoenix.log("Setting bookmark " + key + " for window " + window.title());
      Storage.set("bookmark-" + key, window.hash());
      Phoenix.notify(
        "Bookmark " + key + ": " + window.app().name() + " " + window.title()
      );
    });
  };
}

function executeBookmark(key) {
  return () => {
    const windowHash = Storage.get("bookmark-" + key);
    const allWindows = Window.all();
    // tslint:disable-next-line
    for (let i = 0; i < allWindows.length; i++) {
      const win = allWindows[i];
      if (win.hash() === windowHash) {
        win.focus();
        break;
      }
    }
  };
}

Key.on("left", MODIFIERS, focusClosestNeighbour("left"));
Key.on("right", MODIFIERS, focusClosestNeighbour("right"));
Key.on("up", MODIFIERS, focusClosestNeighbour("up"));
Key.on("down", MODIFIERS, focusClosestNeighbour("down"));

const bookmarkKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
// tslint:disable-next-line
for (let i = 0; i < bookmarkKeys.length; i++) {
  const key = bookmarkKeys[i];
  Key.on(key, MODIFIERS, executeBookmark(key));
  Key.on(key, MODIFIERS.concat(["shift"]), setBookmark(key));
}
*/
