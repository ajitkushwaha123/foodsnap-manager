import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { fork } from "child_process";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

let mainWindow;
let serverProcess;
const workerProcesses = [];

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
      const standalonePath = path.join(__dirname, ".next", "standalone").replace(/app\.asar$/g, 'app.asar.unpacked').replace(/app\.asar\\/g, 'app.asar.unpacked\\').replace(/app\.asar\//g, 'app.asar.unpacked/');
      const serverPath = path.join(standalonePath, "server.js");

      serverProcess = fork(serverPath, [], {
        cwd: standalonePath,
        env: {
          ...process.env,
          PORT: "3000",
          NODE_ENV: "production",
        },
        stdio: 'pipe',
      });

      serverProcess.stdout.on("data", (data) => {
        console.log(`[Next Server]: ${data}`);
      });

      serverProcess.stderr.on("data", (data) => {
        console.error(`[Next Error]: ${data}`);
      });

      // Launch background workers
      const workers = [
        path.join(__dirname, "src/lib/bullmq/workers/zomatoWorker.js"),
        path.join(__dirname, "src/lib/upload-service/worker/productWorker.js"),
        path.join(__dirname, "bull-server/dashboard.js")
      ];

      for (const workerPath of workers) {
        const workerProcess = fork(workerPath, [], {
          env: {
            ...process.env,
            NODE_ENV: "production",
          },
          stdio: 'pipe',
        });

        workerProcess.stdout.on("data", (data) => {
          console.log(`[Worker - ${path.basename(workerPath)}]: ${data}`);
        });

        workerProcess.stderr.on("data", (data) => {
          console.error(`[Worker Error - ${path.basename(workerPath)}]: ${data}`);
        });

        workerProcesses.push(workerProcess);
      }

      // Simple polling mechanism instead of using wait-on
      const waitForServer = async (url, timeout = 30000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
          try {
            await fetch(url);
            return;
          } catch (err) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        throw new Error("Server did not start in time");
      };

      await waitForServer("http://localhost:3000");

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

  for (const worker of workerProcesses) {
    worker.kill();
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