// import "./contants.js";
// import "./keys/movement.js";
// import "./keys/focus.js";
// import "./keys/info.js";

// import Phoenix, { Screen, Window, Storage } from "Phoenix";
// import { Key } from "Key";
import { Grid } from "./grid/Grid";
// import leftpad from "leftpad";

// eval("Phoenix.log('Her logges det', JSON.stringify(Key))");

Phoenix.set({
  openAtLogin: true,
});

const MODIFIERS = ["ctrl", "alt"];

const grid = new Grid({ width: 500, height: 200 });

// @ts-ignore
Key.on("g", MODIFIERS, () => {
  const window: Window = Window.focused();
  // const str = leftpad("abc");
  // const a = str + "b";
  // @ts-ignore
  grid.onNewWindow(window, window.hash());
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
