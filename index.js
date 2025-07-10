const { app, Tray, Menu, globalShortcut, Notification } = require("electron");
const path = require("path");
const robot = require("robotjs");
const { clipboard } = require("electron");
const { getSelectedText } = require("node-get-selected-text");
const unicodeToBamini = require("./convert");

let tray = null;

app.whenReady().then(() => {
  app.setName("TamilBaminiConverter");
  tray = new Tray(path.join(__dirname, "assets/icon.ico"));

  const contextMenu = Menu.buildFromTemplate([{ label: "Quit", role: "quit" }]);
  tray.setToolTip("Tamil Unicode to Bamini");
  tray.setContextMenu(contextMenu);

  globalShortcut.register("Control+Alt+B", () => {
    try {
      // Step 1: Copy selected text
      robot.keyTap("c", ["control"]);
      setTimeout(() => {
        const selectedText = getSelectedText().trim();
        if (!selectedText) {
          new Notification({
            title: "No Text Selected",
            body: "Select some Tamil text to convert.",
          }).show();
          return;
        }

        // Step 2: Convert
        const converted = unicodeToBamini(selectedText);
        console.log(converted);
        clipboard.writeText(converted, "selection");

        // Step 3: Paste
        robot.keyTap("v", ["control"]);

        new Notification({
          title: "Converted",
          body: "Text converted and pasted!",
        }).show();
      }, 300); // Allow time for copy buffer to populate
    } catch (error) {
      new Notification({ title: "Error", body: error.message }).show();
      console.error(error);
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
