import { ACHIEVEMENTS } from "@/constants/constants";
import { Achievement, DailyLog, UserProfile } from "@/types/types";
import { Lock } from "lucide-react";
import React from "react";

interface AchievementsProps {
  user: UserProfile;
  logs: DailyLog[];
}

const AchievementsView: React.FC<AchievementsProps> = ({ user, logs }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-black italic senkai-gradient text-transparent-clip">
          称号・実績
        </h2>
        <span className="text-xs text-zinc-500 font-bold">
          {
            ACHIEVEMENTS.filter((a: Achievement) => a.condition(user, logs))
              .length
          }{" "}
          / {ACHIEVEMENTS.length} 解放
        </span>
      </div>

      <div className="achievements-grid">
        {ACHIEVEMENTS.map((ach: Achievement) => {
          const isUnlocked = ach.condition(user, logs);
          return (
            <div
              key={ach.id}
              className={`achievement-card ${
                isUnlocked
                  ? "achievement-card--unlocked"
                  : "achievement-card--locked"
              }`}
            >
              {!isUnlocked && (
                <Lock
                  className="absolute top-2 right-2 text-zinc-700"
                  size={14}
                />
              )}
              <div
                className={`text-4xl mb-3 ${
                  isUnlocked ? "animate-bounce-short" : ""
                }`}
              >
                {ach.icon}
              </div>
              <h3
                className={`text-xs font-black text-center mb-1 ${
                  isUnlocked ? "text-amber-500" : "text-zinc-400"
                }`}
              >
                {ach.title}
              </h3>
              <p className="text-[9px] text-zinc-500 text-center leading-tight">
                {ach.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsView;
