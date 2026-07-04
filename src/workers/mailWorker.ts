import { Queue, Worker, JobsOptions } from "bullmq";
import IORedis from "ioredis";
import { sendEmail } from "../lib/mailer";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const connection = new IORedis(REDIS_URL);

const mailQueue = new Queue("mailQueue", { connection });

// Export a helper to add jobs
export async function enqueueMail(to: string, subject: string, templateName: string, vars: Record<string, string | number>) {
  const jobData = { to, subject, templateName, vars };
  await mailQueue.add("send", jobData, { attempts: 3, backoff: { type: "exponential", delay: 1000 } } as JobsOptions);
}

// Worker (will run when you start `node ./dist/workers/mailWorker.js` or run ts-node)
if (require.main === module) {
  const worker = new Worker(
    "mailQueue",
    async (job) => {
      const { to, subject, templateName, vars } = job.data;
      const { html, text } = require("../lib/mailer").renderTemplate(templateName, vars);
      await sendEmail({ to, subject, html, text });
    },
    { connection },
  );

  worker.on("completed", (job) => console.log(`Mail job ${job.id} completed`));
  worker.on("failed", (job, err) => console.error(`Mail job ${job?.id} failed`, err));

  console.log("Mail worker started");
}
