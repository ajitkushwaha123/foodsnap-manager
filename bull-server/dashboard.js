import express from "express";
import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { zomatoProductImportQueue } from "../src/lib/bullmq/queue/zomatoProductImportQueue.js";
import { productQueue } from "../src/lib/upload-service/queue/productQueue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(zomatoProductImportQueue),
    new BullMQAdapter(productQueue),
  ],
  serverAdapter,
});

const app = express();
app.use("/admin/queues", serverAdapter.getRouter());

app.listen(3001, () => {
  console.log(
    "📊 Bull Board dashboard running at http://localhost:3001/admin/queues"
  );
});
