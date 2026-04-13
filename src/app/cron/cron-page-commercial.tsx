"use client";

import CronPageOss from "./cron-page-oss";

/**
 * Commercial shell: wraps OSS cron UI; extend with premium scheduling UX in the private monorepo when needed.
 */
export default function CronPageCommercial() {
  return <CronPageOss />;
}
