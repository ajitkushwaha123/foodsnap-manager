import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import waitOn from "wait-on";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let serverProcess;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "FoodSnap Manager",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (app.isPackaged) {
    try {
      const standalonePath = path.join(__dirname, ".next", "standalone");
      const serverPath = path.join(standalonePath, "server.js");

      serverProcess = spawn("node", [serverPath], {
        cwd: standalonePath,
        env: {
          ...process.env,
          PORT: "3000",
          NODE_ENV: "production",
        },
        shell: true,
      });

      serverProcess.stdout.on("data", (data) => {
        console.log(`[Next Server]: ${data}`);
      });

      serverProcess.stderr.on("data", (data) => {
        console.error(`[Next Error]: ${data}`);
      });

      await waitOn({
        resources: ["http://localhost:3000"],
        timeout: 30000,
      });

      await mainWindow.loadURL("http://localhost:3000");
    } catch (error) {
      console.error("Failed to start production server:", error);
    }
  } else {
    await mainWindow.loadURL("http://localhost:3000");
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});