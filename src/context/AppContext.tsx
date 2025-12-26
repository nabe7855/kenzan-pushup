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
  const [session, setSession] = useState<any>(null); // Supabase セッション保持用
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // 最後に正常に読み込んだユーザーIDを保持（重複イベント回避用）
  const lastHandledUserId = React.useRef<string | null>(null);
  // 実行中の Fetch を中断するためのコントローラー
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Supabase Auth 状態の監視
  useEffect(() => {
    console.log("[AppContext] useEffect [Auth] started");
    let mounted = true;

    console.log("[AppContext] Subscribing to onAuthStateChange...");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AppContext] Auth State Changed: ${event}`, {
        hasSession: !!session,
        userId: session?.user?.id,
      });
      setSession(session);

      // セッションが消失した場合は即座にステートをクリア
      if (!session) {
        setIsLoggedIn(false);
        setUser(null);
        setLogs([]);
        lastHandledUserId.current = null;
        setIsLoading(false);
      }
    });

    return () => {
      console.log("[AppContext] useEffect [Auth] CLEANUP");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // データ取得用の Effect
  useEffect(() => {
    let mounted = true;
    const userId = session?.user?.id;

    if (!userId) {
      // セッションがない場合は、isLoadingをfalseに設定し、データ取得をスキップ
      if (mounted) setIsLoading(false);
      return;
    }

    // 1. 重複チェック
    if (userId === lastHandledUserId.current && isLoggedIn && user && !error) {
      console.log(
        `[AppContext] Redundant session for ${userId}. Skipping fetch.`
      );
      setIsLoading(false);
      return;
    }

    const runFetch = async () => {
      // 進行中のリクエストがあれば中断
      if (abortControllerRef.current) {
        console.log(`[AppContext] Aborting previous fetch process...`);
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const signal = controller.signal;

      const eventId = Math.random().toString(36).substring(7);

      try {
        if (mounted) {
          setIsLoading(true);
          setIsLoggedIn(true);
          setError(null);
        }

        // セッション直後の初回のみ、Supabase クライアントの安定を待つ
        if (isFirstLoad) {
          console.log(
            `[AppContext] (${eventId}) Initial warm-up delay (500ms)...`
          );
          await new Promise((res) => setTimeout(res, 500));
          if (mounted) setIsFirstLoad(false);
        }

        if (signal.aborted) return;

        console.log(`[AppContext] (${eventId}) Fetching data for ${userId}...`);

        const [userData, logsData] = await Promise.all([
          loadUser(userId, 0, signal),
          loadLogs(userId, 0, signal),
        ]);

        if (mounted && !signal.aborted) {
          if (userData) {
            console.log(`[AppContext] (${eventId}) Data fetched successfully`, {
              hasUser: !!userData,
              logsCount: logsData?.length,
            });
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
            lastHandledUserId.current = userId;
          } else {
            console.log(
              `[AppContext] (${eventId}) Profile not found, creating new profile for ${userId}...`
            );
            const newProfile = await createProfile(
              userId,
              session.user.email || "",
              session.user.user_metadata?.name,
              signal
            );
            if (mounted && !signal.aborted) {
              setUser(newProfile);
              setLogs([]);
              lastHandledUserId.current = userId;
            }
          }
          setError(null);
        }
      } catch (err: any) {
        if (err.message?.includes("Aborted")) {
          console.log(`[AppContext] (${eventId}) Fetch aborted.`);
          return;
        }
        console.error(`[AppContext] (${eventId}) Fetch error:`, err);
        if (mounted && !signal.aborted) {
          setError(err.message || "データ取得中にエラーが発生しました。");
        }
      } finally {
        if (mounted && !signal.aborted) {
          setIsLoading(false);
          if (abortControllerRef.current === controller) {
            abortControllerRef.current = null;
          }
        }
      }
    };

    runFetch();

    return () => {
      console.log("[AppContext] useEffect [Data Fetch] CLEANUP");
      mounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [session]);

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
