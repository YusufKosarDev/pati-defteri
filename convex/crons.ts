import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Her gün UTC 07:00'de (TR saat 10:00) tüm kullanıcılar için
// yaklaşan/gecikmiş bakım taraması yap ve push gönder.
crons.cron(
  "daily care reminders",
  "0 7 * * *",
  internal.reminders.dailySweep
);

export default crons;
