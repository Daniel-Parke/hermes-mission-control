"use client";

import { getPublicMcEdition } from "@agent-control-hub/config";
import CronPageCommercial from "./cron-page-commercial";
import CronPageOss from "./cron-page-oss";

const isCommercial = getPublicMcEdition() === "commercial";

export default function CronPage() {
  if (isCommercial) return <CronPageCommercial />;
  return <CronPageOss />;
}
