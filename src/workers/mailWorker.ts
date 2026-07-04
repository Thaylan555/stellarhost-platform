import { Queue, Worker, JobsOptions } from "bullmq";
import IORedis from "ioredis";
import { sendEmail, renderMjmlTemplate } from "../lib/mailer";
import { updateEmailStatus } from "../lib/emailStore";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const connection = new IORedis(REDIS_URL);

const mailQueue = new Queue("mailQueue", { connection });

export async function enqueueMail(to: string, subject: string, templateName: string, vars: Record<string, string | number | boolean>, idempotencyKey?: string) {
  const jobData = { to, subject, templateName, vars, idempotencyKey };
  await mailQueue.add("send", jobData, { attempts: 5, backoff: { type: "exponential", delay: 2000 } } as JobsOptions);
}

if (require.main === module) {
  const worker = new Worker(
    "mailQueue",
    async (job) => {
      const { to, subject, templateName, vars } = job.data;
      try {
        await sendEmail({ to, subject, templateName, vars, idempotencyKey: job.id as string });
      } catch (e) {
        console.error("Mail worker failed to send", e);
        await updateEmailStatus(job.id as string, "failed", null, String(e));
        throw e;
      }
    },
    { connection },
  );

  worker.on("completed", (job) => console.log(`Mail job ${job.id} completed`));
  worker.on("failed", (job, err) => console.error(`Mail job ${job?.id} failed`, err));

  console.log("Mail worker started");
}
