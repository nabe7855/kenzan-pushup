"use client";

import { useAppContext } from "@/context/AppContext";
import { getOrCreateTodayLog } from "@/lib/storage";
import { useMemo } from "react";
import HomeView from "./HomeView";

export default function Home() {
  const { user, logs, addSet } = useAppContext();

  const todayLog = useMemo(() => {
    if (!user) return null;
    const { todayLog } = getOrCreateTodayLog(logs, user);
    return todayLog;
  }, [logs, user]);

  if (!user || !todayLog) return null;

  return (
    <HomeView
      user={user}
      todayLog={todayLog}
      onAddSet={async (count) => await addSet(count)}
      onUndoLastSet={() => {}}
    />
  );
}
