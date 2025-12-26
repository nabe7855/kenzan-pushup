import {
  getXPForNextLevel,
  VARIATIONS,
  XP_PER_PUSHUP,
} from "@/constants/constants";
import { UserProfile } from "@/types/types";
import { Infinity, ListChecks, Play, Timer, X, Zap } from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";

interface TrainingProps {
  user: UserProfile;
  onFinish: (
    count: number,
    details?: { variationName: string; count: number }[]
  ) => void;
  onCancel: () => void;
}

type TrainingMode = "infinite" | "task";

const TrainingView: React.FC<TrainingProps> = ({
  user,
  onFinish,
  onCancel,
}) => {
  const [mode, setMode] = useState<TrainingMode | null>(null);
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shake, setShake] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [xpAnimationStart, setXpAnimationStart] = useState(false);

  // Task Mode specific states
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [repsInCurrentTask, setRepsInCurrentTask] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<
    { variationName: string; count: number }[]
  >([]);

  // Safety mechanism: Long press to finish
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<number | null>(null);
  const HOLD_DURATION = 1500; // 1.5 seconds

  const currentTask = useMemo(() => {
    if (mode === "task" && user.targetBreakdown.length > 0) {
      return user.targetBreakdown[currentTaskIndex];
    }
    return null;
  }, [mode, currentTaskIndex, user.targetBreakdown]);

  const currentVariation = useMemo(() => {
    if (!currentTask) return null;
    return VARIATIONS.find((v) => v.name === currentTask.variationName);
  }, [currentTask]);

  // XP Progress Calculation
  const startXp = user.xp;
  const earnedXp = count * XP_PER_PUSHUP * 10;
  const finalXp = startXp + earnedXp;

  const currentLevelMax = getXPForNextLevel(user.level);
  const startProgress = (startXp / currentLevelMax) * 100;
  const endProgress = (finalXp / currentLevelMax) * 100;

  const progressIntensity = useMemo(() => Math.min(count / 100, 1), [count]);
  const baseHue = useMemo(() => (200 + count * 2) % 360, [count]);

  const handleTap = useCallback(() => {
    if (isFinishing || holdProgress > 0 || !mode) return;

    setCount((prev) => prev + 1);

    if (mode === "task" && currentTask) {
      const nextReps = repsInCurrentTask + 1;
      setRepsInCurrentTask(nextReps);

      if (nextReps >= currentTask.count) {
        // Record completed task in session history
        setSessionHistory((prev) => [
          ...prev,
          { variationName: currentTask.variationName, count: nextReps },
        ]);

        if (currentTaskIndex < user.targetBreakdown.length - 1) {
          setCurrentTaskIndex((prev) => prev + 1);
          setRepsInCurrentTask(0);
          if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
        }
      }
    }

    setIsAnimating(true);
    setShake(true);

    if ("vibrate" in navigator) {
      navigator.vibrate(count < 50 ? 40 : 60);
    }

    setTimeout(() => {
      setIsAnimating(false);
      setShake(false);
    }, 150);
  }, [
    count,
    isFinishing,
    holdProgress,
    mode,
    currentTask,
    currentTaskIndex,
    repsInCurrentTask,
    user.targetBreakdown,
  ]);

  const handleFinishSequence = () => {
    setIsFinishing(true);
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100, 50, 300]);
    }

    // Finalize history if there's an ongoing task that wasn't pushed to history yet
    let finalDetails: { variationName: string; count: number }[] | undefined =
      undefined;
    if (mode === "task") {
      const finalHistory = [...sessionHistory];
      if (
        currentTask &&
        repsInCurrentTask > 0 &&
        (finalHistory.length === 0 ||
          finalHistory[finalHistory.length - 1].variationName !==
            currentTask.variationName)
      ) {
        finalHistory.push({
          variationName: currentTask.variationName,
          count: repsInCurrentTask,
        });
      }
      finalDetails = finalHistory;
    }

    setTimeout(() => {
      setXpAnimationStart(true);
    }, 800);
    setTimeout(() => {
      onFinish(count, finalDetails);
    }, 3500);
  };

  const startHold = () => {
    if (count === 0 || isFinishing) return;
    const startTime = Date.now();
    holdTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        handleFinishSequence();
      }
    }, 16);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (!isFinishing) {
      setHoldProgress(0);
    }
  };

  if (!mode) {
    return (
      <div className="training-overlay">
        <div className="training-bg-gradient" />
        <h2 className="text-3xl font-black italic senkai-gradient text-transparent-clip mb-2">
          鍛錬モード選択
        </h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-12">
          修行のスタイルを選んでください
        </p>

        <div className="w-full max-w-xs space-y-4 relative z-10">
          <button
            onClick={() => setMode("infinite")}
            className="w-full p-6 bg-zinc-900 border border-zinc-800 rounded-3xl group active:scale-95 transition-all text-left relative overflow-hidden"
          >
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <Infinity
                size={120}
                className="translate-x-1/4 translate-y-1/4"
              />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black">
                <Infinity size={24} />
              </div>
              <span className="text-xl font-black text-white italic">
                無限累計
              </span>
            </div>
            <p className="text-zinc-500 text-[10px] font-bold leading-relaxed uppercase">
              回数を決めず、ただひたすらに
              <br />
              己の限界まで肉体を追い込む。
            </p>
          </button>

          <button
            disabled={user.targetBreakdown.length === 0}
            onClick={() => setMode("task")}
            className={`w-full p-6 bg-zinc-900 border border-zinc-800 rounded-3xl group active:scale-95 transition-all text-left relative overflow-hidden ${
              user.targetBreakdown.length === 0 ? "opacity-50 grayscale" : ""
            }`}
          >
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <ListChecks
                size={120}
                className="translate-x-1/4 translate-y-1/4"
              />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white">
                <Play size={24} />
              </div>
              <span className="text-xl font-black text-white italic">
                任務遂行 (Navi)
              </span>
            </div>
            <p className="text-zinc-500 text-[10px] font-bold leading-relaxed uppercase">
              設定したメニューを順に消化。
              <br />
              極意を切り替えながら千回を目指す。
            </p>
            {user.targetBreakdown.length === 0 && (
              <p className="text-[8px] text-red-500 mt-2 font-black italic">
                ※設定ページで内訳を登録してください
              </p>
            )}
          </button>

          <button
            onClick={onCancel}
            className="w-full text-zinc-600 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors pt-8"
          >
            修行を中断
          </button>
        </div>
      </div>
    );
  }

  const bgStyle = {
    background: isFinishing
      ? `radial-gradient(circle at center, rgba(255,165,0,0.2) 0%, black 100%)`
      : `radial-gradient(circle at center, 
        hsl(${baseHue}, ${40 + progressIntensity * 60}%, ${
          10 + progressIntensity * 20
        }%) 0%, 
        black 100%)`,
    transition: "background 1.5s ease-out",
  };

  return (
    <div
      className={`training-overlay transition-all duration-300 ${
        shake ? "scale-105" : "scale-100"
      }`}
      style={bgStyle}
    >
      {!isFinishing && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: 0.1 + progressIntensity * 0.4,
            background: `conic-gradient(from ${
              count * 10
            }deg, transparent, hsl(${baseHue}, 100%, 50%), transparent)`,
            filter: "blur(100px)",
            animation: "spin 10s linear infinite",
          }}
        />
      )}

      {isFinishing && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs space-y-12">
            <div className="relative z-10 text-center animate-slide-in-bottom">
              <div className="flex items-center justify-center gap-2 mb-2 animate-bounce">
                <Zap className="text-amber-400 fill-amber-400" size={32} />
                <h2 className="text-2xl font-black italic text-white tracking-tighter drop-shadow-lg">
                  EXPERIENCE EARNED
                </h2>
              </div>
              <div className="text-7xl font-black italic text-white tabular-nums">
                +{earnedXp}
                <span className="text-2xl not-italic ml-2 text-amber-500">
                  XP
                </span>
              </div>
            </div>

            <div
              className={`relative space-y-4 transition-all duration-1000 ${
                xpAnimationStart
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
            >
              <div className="flex justify-between items-end mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black italic rounded">
                    LV.{user.level}
                  </div>
                </div>
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">
                  Next: LV.{user.level + 1}
                </div>
              </div>

              <div className="h-10 w-full bg-zinc-900/50 rounded-2xl p-1 border border-zinc-800 shadow-inner overflow-hidden relative">
                <div
                  className="absolute left-1 top-1 bottom-1 bg-zinc-700 rounded-xl opacity-30 transition-all duration-500"
                  style={{ width: `calc(${startProgress}% - 8px)` }}
                />

                <div
                  className={`absolute left-1 top-1 bottom-1 senkai-gradient rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center justify-end px-3 transition-all ${
                    xpAnimationStart
                      ? "duration-[1500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                      : "duration-0"
                  }`}
                  style={{
                    width: `calc(${
                      xpAnimationStart ? endProgress : startProgress
                    }% - 8px)`,
                  }}
                >
                  <div className="w-2 h-full bg-white/40 blur-sm rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="w-full flex justify-between items-center z-10">
        <button
          onClick={() => setMode(null)}
          disabled={isFinishing}
          className="w-12 h-12 rounded-full bg-zinc-900/50 backdrop-blur-md flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            {mode === "infinite" ? (
              <Infinity size={16} className="text-amber-500" />
            ) : (
              <ListChecks size={16} className="text-red-500" />
            )}
            <span className="text-white font-black italic text-xs tracking-widest uppercase">
              {mode === "infinite" ? "Infinite Mode" : "Navigation Mode"}
            </span>
          </div>
          <p className="text-[8px] text-zinc-500 font-bold tracking-tighter mt-0.5">
            {isFinishing
              ? "CALCULATING..."
              : count < 50
              ? "Basic Focus"
              : count < 100
              ? "Warrior Mode"
              : "God-Like Senkai"}
          </p>
        </div>
        <div className="w-12" />
      </div>

      {/* Mode Specific UI - Navigation */}
      {!isFinishing && mode === "task" && currentTask && (
        <div className="w-full max-w-xs animate-slide-in-bottom">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-amber-500 border border-zinc-700">
                  {currentVariation?.icon || <Zap size={24} />}
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    現在遂行中
                  </p>
                  <h3 className="text-lg font-black text-white italic">
                    {currentTask.variationName}
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black italic text-amber-500 tabular-nums">
                  {repsInCurrentTask}
                  <span className="text-[10px] not-italic text-zinc-500 ml-1">
                    / {currentTask.count}
                  </span>
                </p>
              </div>
            </div>

            {/* Individual task progress bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{
                  width: `${(repsInCurrentTask / currentTask.count) * 100}%`,
                }}
              />
            </div>

            {/* Next Task Hint */}
            {user.targetBreakdown[currentTaskIndex + 1] && (
              <div className="flex items-center justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest border-t border-zinc-800/50 pt-4">
                <span className="flex items-center gap-1 opacity-50">
                  <Timer size={10} /> NEXT MISSION
                </span>
                <span className="text-white opacity-80">
                  {user.targetBreakdown[currentTaskIndex + 1].variationName} (
                  {user.targetBreakdown[currentTaskIndex + 1].count})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Counter Main Area */}
      <div
        onClick={handleTap}
        className={`flex-1 w-full flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform relative overflow-visible ${
          isFinishing ? "opacity-0 scale-50" : "opacity-100 scale-100"
        } duration-500`}
      >
        <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-[10px] z-10 transition-opacity">
          TAP TO PUSH UP
        </p>

        <div className="relative z-10 overflow-visible">
          <div className="training-glow" />

          <div
            className="counter-number senkai-gradient text-transparent-clip"
            style={{
              color: isAnimating ? "white" : undefined,
              filter:
                count > 20
                  ? `drop-shadow(0 0 ${
                      20 + progressIntensity * 40
                    }px hsl(${baseHue}, 100%, 50%))`
                  : "none",
            }}
          >
            {count}
          </div>
          <div
            className="absolute inset-0 blur-3xl -z-10 transition-all duration-500"
            style={{
              background: `hsl(${baseHue}, 100%, 50%)`,
              opacity: progressIntensity * 0.3,
              transform: `scale(${1 + progressIntensity})`,
            }}
          />
        </div>

        {mode === "infinite" && (
          <div className="w-48 h-1.5 bg-zinc-800/50 rounded-full overflow-hidden mt-0">
            <div
              className="h-full transition-all duration-300 shadow-[0_0_10px_white]"
              style={{
                width: `${Math.min((count % 50) * 2, 100)}%`,
                backgroundColor: `hsl(${baseHue}, 100%, 60%)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Footer / Finish Button */}
      <div
        className={`w-full z-10 pb-8 space-y-4 ${
          isFinishing ? "opacity-0 translate-y-20" : "opacity-100 translate-y-0"
        } transition-all duration-500`}
      >
        <button
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          disabled={count === 0 || isFinishing}
          className={`w-full h-24 rounded-3xl font-black text-xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${
            count > 0
              ? "bg-zinc-900 border-2 border-white/20 text-white shadow-xl"
              : "bg-zinc-800 text-zinc-600"
          }`}
        >
          {holdProgress > 0 && (
            <div
              className="absolute inset-0 bg-white/20 transition-all duration-75"
              style={{ width: `${holdProgress}%` }}
            />
          )}

          <div className="relative z-10 flex flex-col items-center">
            {holdProgress > 0 ? (
              <>
                <span className="animate-pulse">HOLDING...</span>
                <span className="text-[10px] opacity-60 uppercase tracking-widest mt-1">
                  Don't let go!
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Timer size={20} className="text-amber-500" />
                  <span>長押しで記録完了</span>
                </div>
                {count > 0 && (
                  <span className="text-[10px] opacity-40 uppercase tracking-widest mt-1 font-bold">
                    Safety: 1.5s Hold Required
                  </span>
                )}
              </>
            )}
          </div>
        </button>

        <p className="text-zinc-500 text-center text-[10px] font-bold uppercase tracking-widest opacity-60">
          {count === 0
            ? "床に置いて、胸や顎でタップ"
            : `${count}回達成中！タップで継続`}
        </p>
      </div>
    </div>
  );
};

export default TrainingView;
