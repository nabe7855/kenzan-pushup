"use client";

import { useAppContext } from "@/context/AppContext";
import StatsView from "./StatsView";

export default function StatsPage() {
  const { user, logs } = useAppContext();

  if (!user) return null;

  return <StatsView user={user} logs={logs} totalPushUps={user.totalPushUps} />;
}
