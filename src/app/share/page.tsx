"use client";

import { useAppContext } from "@/context/AppContext";
import { getOrCreateTodayLog } from "@/lib/storage";
import ShareView from "./ShareView";

export default function SharePage() {
  const { user, logs } = useAppContext();

  if (!user) return null;

  const { todayLog } = getOrCreateTodayLog(logs, user);

  return <ShareView user={user} todayLog={todayLog} />;
}
