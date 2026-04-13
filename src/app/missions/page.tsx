"use client";

import { getPublicMcEdition } from "@agent-control-hub/config";
import MissionsPageCommercial from "./missions-page-commercial";
import MissionsPageOss from "./missions-page-oss";

const isCommercial = getPublicMcEdition() === "commercial";

export default function MissionsPage() {
  if (isCommercial) return <MissionsPageCommercial />;
  return <MissionsPageOss />;
}
