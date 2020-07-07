const path = "/Users/vramdal/Phoenix/phoenix-padding-master";

require(path + "/constants.js");
require(path + "/keys/movement.js");
require(path + "/keys/focus.js");
require(path + "/keys/info.js");

import Phoenix, { Screen, Window, Key } from "phoenix";
import Storage from "storage";

Phoenix.set({
  openAtLogin: true,
});

const MODIFIERS = ["ctrl", "alt"];

Key.on("z", MODIFIERS, function () {
  const screen = Screen.main().flippedVisibleFrame();
  const window = Window.focused();

  if (window) {
    window.setTopLeft({
      x: screen.x + screen.width / 2 - window.frame().width / 2,
      y: screen.y + screen.height / 2 - window.frame().height / 2,
    });
  }
});

const windowIsMaximised = function (window) {
  return !!Storage.get(getWindowId(window));
};

const getWindowId = function (window) {
  return "window-" + window.hash();
};

Key.on("m", MODIFIERS, function () {
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
  return function () {
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
      const neighbourNames = neighbours.map(function (neighbor) {
        return neighbor.title();
      });
      Phoenix.log(
        "Direction",
        direction,
        "neighbourNames",
        JSON.stringify(neighbourNames)
      );
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
  return function () {
    withFocusedWindow(function (window) {
      Phoenix.log("Setting bookmark " + key + " for window " + window.title());
      Storage.set("bookmark-" + key, window.hash());
      Phoenix.notify(
        "Bookmark " + key + ": " + window.app().name() + " " + window.title()
      );
    });
  };
}

function executeBookmark(key) {
  return function () {
    const windowHash = Storage.get("bookmark-" + key);
    const allWindows = Window.all();
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
for (let i = 0; i < bookmarkKeys.length; i++) {
  const key = bookmarkKeys[i];
  Key.on(key, MODIFIERS, executeBookmark(key));
  Key.on(key, MODIFIERS.concat(["shift"]), setBookmark(key));
}
