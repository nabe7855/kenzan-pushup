"use client";

import { getLevel, XP_PER_PUSHUP } from "@/constants/constants";
import {
  createProfile,
  getTodayStr,
  insertWorkout,
  loadLogs,
  loadUser,
  saveUser,
  updateTargetBreakdown,
  upsertDailyLog,
} from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { DailyLog, PushUpSet, UserProfile } from "@/types/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AppContextType {
  user: UserProfile | null;
  logs: DailyLog[];
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  showConfetti: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  setLogs: React.Dispatch<React.SetStateAction<DailyLog[]>>;
  login: (
    email: string,
    password: string,
    isSignUp: boolean,
    name?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  addSet: (
    count: number,
    details?: { variationName: string; count: number }[]
  ) => Promise<void>;
  setShowConfetti: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 最後に正常に読み込んだユーザーIDを保持（重複イベント回避用）
  const lastHandledUserId = React.useRef<string | null>(null);

  // Supabase Auth 状態の監視
  useEffect(() => {
    console.log("[AppContext] useEffect [Auth] started");
    let mounted = true;
    let currentEventId = 0; // 同時実行を防ぐためのカウンター

    // 45秒後に強制的に読み込み状態を解除するセーフティタイマー（コールドスタート考慮）
    const timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn(
          "[AppContext] Auth initialization TIMED OUT after 45s. Forcing isLoading to false."
        );
        setIsLoading(false);
      }
    }, 45000);

    console.log("[AppContext] Subscribing to onAuthStateChange...");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const eventId = ++currentEventId;
      const userId = session?.user?.id || null;

      console.log(`[AppContext] Auth State Changed (${eventId}): ${event}`, {
        hasSession: !!session,
        userId,
      });

      // 1. セッションがない場合：ステートリセットして終了
      if (!session?.user) {
        if (mounted && currentEventId === eventId) {
          setIsLoading(false);
          setIsLoggedIn(false);
          setUser(null);
          setLogs([]);
          lastHandledUserId.current = null;
        }
        return;
      }

      // 2. セッションがある場合：既存ユーザーとの重複チェック
      if (
        userId &&
        userId === lastHandledUserId.current &&
        isLoggedIn &&
        user &&
        !error
      ) {
        console.log(
          `[AppContext] (${eventId}) Redundant session event for ${userId}. Skipping fetch.`
        );
        setIsLoading(false);
        return;
      }

      // 3. データ取得開始
      try {
        if (mounted && currentEventId === eventId) {
          setIsLoading(true);
          setIsLoggedIn(true);
          setError(null);
        }

        // Supabase Client の内部状態（Auth Token）が安定するのを待つ
        await new Promise((res) => setTimeout(res, 200));

        console.log(
          `[AppContext] (${eventId}) Fetching user and logs for ${session.user.id}...`
        );

        // 並列でユーザーデータとログを読み込み
        const [userData, logsData] = await Promise.all([
          loadUser(session.user.id),
          loadLogs(session.user.id),
        ]);

        if (mounted && currentEventId === eventId) {
          if (userData) {
            console.log(`[AppContext] (${eventId}) Data fetched successfully`, {
              hasUser: !!userData,
              logsCount: logsData?.length,
            });
            // 状態が実際に変わる場合のみ更新
            setUser((prev) =>
              JSON.stringify(prev) !== JSON.stringify(userData)
                ? userData
                : prev
            );
            setLogs((prev) =>
              JSON.stringify(prev) !== JSON.stringify(logsData)
                ? logsData
                : prev
            );
            setError(null);
            lastHandledUserId.current = session.user.id;
          } else {
            // プロフィールが存在しない場合は新規作成
            console.log(
              `[AppContext] (${eventId}) Profile not found, creating new profile for ${session.user.id}...`
            );
            const newProfile = await createProfile(
              session.user.id,
              session.user.email || "",
              session.user.user_metadata?.name
            );
            if (mounted && currentEventId === eventId) {
              setUser(newProfile);
              setLogs([]);
              setError(null);
              lastHandledUserId.current = session.user.id;
            }
          }
        }
      } catch (err: any) {
        console.error(
          `[AppContext] (${eventId}) Auth state handling CRITICAL error:`,
          err
        );
        if (mounted && currentEventId === eventId) {
          setError(err.message || "認証処理中にエラーが発生しました。");
        }
      } finally {
        if (mounted && currentEventId === eventId) {
          console.log(
            `[AppContext] (${eventId}) Setting isLoading to false [FINALLY]`
          );
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    });

    return () => {
      console.log("[AppContext] useEffect [Auth] CLEANUP");
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const login = async (
    email: string,
    password: string,
    isSignUp: boolean,
    name?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Login/SignUp error:", err);
      setError(err.message || "認証に失敗しました。");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    console.log("[AppContext] updateUser START", updates);
    const updatedUser = { ...user, ...updates };

    try {
      // 1. プロフィール基本情報を保存
      console.log("[AppContext] Calling saveUser...");
      await saveUser(updatedUser);

      // 2. 内訳が更新対象に含まれている場合、テーブルを同期
      if (updates.targetBreakdown) {
        console.log("[AppContext] Updating target breakdown...");
        // The original instruction had `const { updateTargetBreakdown } = await import("@/lib/storage");`
        // but it's better to import it directly at the top if it's always used.
        await updateTargetBreakdown(user.id, updates.targetBreakdown);
      }

      console.log("[AppContext] updateUser SUCCESS, updating local state");
      setUser(updatedUser);
    } catch (err) {
      console.error("[AppContext] updateUser FAILED:", err);
      throw err;
    }
  };

  const addSet = useCallback(
    async (
      count: number,
      details?: { variationName: string; count: number }[]
    ) => {
      if (!user || count <= 0) return;

      const today = getTodayStr();
      const newLogs = [...logs];
      let todayIdx = newLogs.findIndex((l) => l.date === today);
      const now = Date.now();

      const newSets: PushUpSet[] = [];
      if (details && details.length > 0) {
        details.forEach((d, idx) => {
          newSets.push({
            id: Math.random().toString(36).substring(2, 11),
            count: d.count,
            timestamp: now + idx,
            variationName: d.variationName,
          });
        });
      } else {
        newSets.push({
          id: Math.random().toString(36).substring(2, 11),
          count,
          timestamp: now,
        });
      }

      const setReps = user.targetBreakdown.reduce((sum, i) => sum + i.count, 0);
      const isActuallySet = count >= setReps * 0.8;

      let todayLog: DailyLog;

      if (todayIdx === -1) {
        todayLog = {
          date: today,
          sets: newSets,
          target: user.dailyTarget,
          totalCount: count,
          achieved: count >= user.dailyTarget,
          targetSets: user.dailyTargetSets,
          completedSetsCount: isActuallySet ? 1 : 0,
        };
        newLogs.unshift(todayLog);
      } else {
        todayLog = { ...newLogs[todayIdx] };
        todayLog.sets = [...todayLog.sets, ...newSets];
        todayLog.totalCount += count;
        if (isActuallySet) todayLog.completedSetsCount += 1;

        if (!todayLog.achieved && todayLog.totalCount >= todayLog.target) {
          todayLog.achieved = true;
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
        newLogs[todayIdx] = todayLog;
      }

      // Supabase へ保存
      try {
        // 1. 各ワークアウトを保存
        for (const s of newSets) {
          await insertWorkout(user.id, s);
        }
        // 2. 日次ログを更新
        await upsertDailyLog(user.id, todayLog);

        // 3. プロフィールを更新
        const updatedUser = {
          ...user,
          xp: user.xp + count * XP_PER_PUSHUP,
          level: getLevel(user.xp + count * XP_PER_PUSHUP),
          totalPushUps: user.totalPushUps + count,
          lastSetTimestamp: now,
          ...(todayLog.achieved && todayLog.date !== user.lastActiveDate
            ? {
                currentStreak: user.currentStreak + 1,
                bestStreak: Math.max(user.bestStreak, user.currentStreak + 1),
                lastActiveDate: today,
              }
            : {}),
        };
        await saveUser(updatedUser);

        // ローカルステートの更新
        setLogs(newLogs);
        setUser(updatedUser);
      } catch (err) {
        console.error("Failed to save work out to Supabase:", err);
      }
    },
    [logs, user]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        logs,
        isLoggedIn,
        isLoading,
        error,
        showConfetti,
        setUser,
        updateUser,
        setLogs,
        login,
        logout,
        addSet,
        setShowConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
