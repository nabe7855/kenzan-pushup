"use client";

import { useAppContext } from "@/context/AppContext";
import AchievementsView from "./AchievementsView";
import SettingsView from "./SettingsView";

export default function SettingsPage() {
  const { user, logs, logout, updateUser } = useAppContext();

  if (!user) return null;

  return (
    <div className="space-y-8">
      <SettingsView user={user} onSave={updateUser} onLogout={logout} />
      <AchievementsView user={user} logs={logs} />
    </div>
  );
}
