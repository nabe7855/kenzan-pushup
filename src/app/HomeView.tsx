import { getXPForNextLevel } from "@/constants/constants";
import { DailyLog, UserProfile } from "@/types/types";
import { Clock, Flame, Target, Timer, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import PushUpCounter from "../components/PushUpCounter";

interface HomeProps {
  user: UserProfile;
  todayLog: DailyLog;
  onAddSet: (count: number) => void;
  onUndoLastSet: () => void;
}

const HomeView: React.FC<HomeProps> = ({
  user,
  todayLog,
  onAddSet,
  onUndoLastSet,
}) => {
  const progress = Math.min((todayLog.totalCount / todayLog.target) * 100, 100);
  const nextXP = getXPForNextLevel(user.level);
  const levelProgress = (user.xp / nextXP) * 100;

  // Countdown logic
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [recommendedIntervalMin, setRecommendedIntervalMin] =
    useState<number>(0);

  useEffect(() => {
    const lastSetTime = user.lastSetTimestamp;
    if (
      !lastSetTime ||
      todayLog.completedSetsCount >= todayLog.targetSets ||
      todayLog.sets.length === 0
    ) {
      setTimeLeft(null);
      return;
    }

    // 動的ロジック:
    // 1. その日の最初のセットを基準にする
    const firstSetTime = todayLog.sets[0].timestamp;
    // 2. 目標終了時刻 = 最初のセット時間 + 設定された完遂時間(h)
    const targetDeadline =
      firstSetTime + user.completionWindowHours * 60 * 60 * 1000;

    const tick = () => {
      const now = Date.now();
      const remainingTime = targetDeadline - now;
      const remainingSets = todayLog.targetSets - todayLog.completedSetsCount;

      if (remainingSets <= 0) {
        setTimeLeft(null);
        return;
      }

      // 次のセットまでの推奨間隔 = 残り時間 / 残りセット数
      // ただし、前回のセット完了時からの経過時間を考慮する必要がある
      const recommendedInterval = remainingTime / remainingSets;
      setRecommendedIntervalMin(Math.floor(recommendedInterval / 60000));
      const nextSetTime = lastSetTime + recommendedInterval;

      const diff = nextSetTime - now;

      if (diff <= 0) {
        setTimeLeft("READY"); // 時間が来たら強調表示
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      if (h > 0) parts.push(h.toString().padStart(2, "0"));
      parts.push(m.toString().padStart(2, "0"));
      parts.push(s.toString().padStart(2, "0"));

      setTimeLeft(parts.join(":"));
    };

    tick();
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, [
    user.lastSetTimestamp,
    user.completionWindowHours,
    todayLog.completedSetsCount,
    todayLog.targetSets,
    todayLog.sets,
  ]);

  return (
    <div className="space-y-6">
      {/* Level & XP Info */}
      <div className="player-info-card">
        <div className="flex items-center gap-3">
          <div className="player-level-badge senkai-gradient">
            Lv{user.level}
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
              プレイヤーランク
            </p>
            <p className="text-white font-black">{user.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 font-bold mb-1">
            XP PROGRESS
          </p>
          <div className="xp-progress-bar-container">
            <div
              className="h-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1 font-mono">
            {user.xp} / {nextXP} XP
          </p>
        </div>
      </div>

      {/* Countdown Card (if applicable) */}
      {timeLeft && (
        <div
          className={`countdown-card ${
            timeLeft === "READY"
              ? "bg-red-500/20 border-red-500/50 animate-pulse"
              : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-black ${
                timeLeft === "READY" ? "bg-red-500" : "bg-amber-500"
              }`}
            >
              <Timer size={24} />
            </div>
            <div>
              <p
                className={`text-[10px] font-black uppercase tracking-widest ${
                  timeLeft === "READY" ? "text-red-500" : "text-amber-500"
                }`}
              >
                {timeLeft === "READY" ? "修行再開の時" : "次セットまでの猶予"}
              </p>
              <p
                className={`text-2xl font-black italic tabular-nums text-white ${
                  timeLeft === "READY" ? "animate-bounce" : ""
                }`}
              >
                {timeLeft === "READY" ? "SET START!" : timeLeft}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 font-bold">動的間隔</p>
            <p className="text-xs font-bold text-zinc-400">
              {recommendedIntervalMin}分 / セット
            </p>
          </div>
        </div>
      )}

      {/* Progress Card */}
      <div className="progress-card">
        <div className="absolute top-0 right-0 p-4 flex flex-col items-center">
          <Flame
            className={
              user.currentStreak > 0 ? "text-orange-500" : "text-zinc-700"
            }
            size={32}
          />
          <span className="block text-center text-[10px] font-black mt-1 uppercase text-zinc-500">
            {user.currentStreak}日継続
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Target size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">
              本日のミッション
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl font-black italic tabular-nums leading-none">
              {todayLog.totalCount}
            </h2>
            <span className="text-zinc-500 font-bold">
              / {todayLog.target} 回
            </span>
          </div>
          <p className="text-[10px] font-black text-amber-500 uppercase mt-2 tracking-tighter">
            目標セット完了数: {todayLog.completedSetsCount} /{" "}
            {todayLog.targetSets}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-4 bg-zinc-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full senkai-gradient transition-all duration-700 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-500">
          <span>{Math.floor(progress)}% 完了</span>
          <span>
            残り {Math.max(todayLog.target - todayLog.totalCount, 0)} 回
          </span>
        </div>
      </div>

      {/* Counter */}
      <PushUpCounter
        onAddSet={onAddSet}
        onUndoLastSet={onUndoLastSet}
        todayCount={todayLog.totalCount}
      />

      {/* Quick Stats Grid */}
      <div className="stat-card-grid">
        <div className="mini-stat-card">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <TrendingUp size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              累計回数
            </span>
          </div>
          <p className="text-2xl font-black tabular-nums">
            {user.totalPushUps.toLocaleString()}
          </p>
        </div>
        <div className="mini-stat-card">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Clock size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              最高継続
            </span>
          </div>
          <p className="text-2xl font-black tabular-nums">
            {user.bestStreak} <span className="text-xs">日</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
