import { DailyLog, PushUpSet, TargetItem, UserProfile } from "@/types/types";
import { supabase } from "./supabase";

// 同時実行中のリクエストを管理するためのキャッシュ
const inflightUserLoads = new Map<string, Promise<UserProfile | null>>();
const inflightLogsLoads = new Map<string, Promise<DailyLog[]>>();

/**
 * Executes a promise with a timeout.
 */
async function withTimeout<T>(
  label: string,
  promise: Promise<T> | { then: (onfulfilled: (value: T) => void) => any },
  ms: number = 10000,
  signal?: AbortSignal
): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`[Storage] Timeout: ${label} after ${ms}ms`));
    }, ms);

    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        reject(new Error(`[Storage] Aborted: ${label}`));
      });
    }
  });

  const startTime = Date.now();
  try {
    if (signal?.aborted) {
      throw new Error(`[Storage] Aborted: ${label}`);
    }
    const result = await Promise.race([
      Promise.resolve(promise as Promise<T>),
      timeoutPromise,
    ]);
    const duration = Date.now() - startTime;
    console.log(`[Storage] Query Success: ${label} (${duration}ms)`);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.warn(
      `[Storage] Query Failed/Timeout: ${label} (${duration}ms)`,
      error
    );
    clearTimeout(timeoutId);
    throw error;
  }
}

export const saveUser = async (user: UserProfile) => {
  const { error } = await supabase
    .from("profiles")
    .update({
      name: user.name,
      avatar_url: user.avatarUrl,
      level: user.level,
      xp: user.xp,
      total_pushups: user.totalPushUps,
      current_streak: user.currentStreak,
      best_streak: user.bestStreak,
      last_active_date: user.lastActiveDate,
      daily_target: user.dailyTarget,
      daily_target_sets: user.dailyTargetSets,
      completion_window_hours: user.completionWindowHours,
      last_set_timestamp: user.lastSetTimestamp
        ? new Date(user.lastSetTimestamp).toISOString()
        : null,
    })
    .eq("id", user.id);

  if (error) throw error;
};

export const createProfile = async (
  id: string,
  email: string,
  name?: string,
  signal?: AbortSignal
): Promise<UserProfile> => {
  console.log(`[Storage] createProfile for id: ${id}`);
  const newProfile = {
    id,
    email,
    name: name || email.split("@")[0],
    level: 1,
    xp: 0,
    total_pushups: 0,
    current_streak: 0,
    best_streak: 0,
    daily_target: 50,
    daily_target_sets: 5,
    completion_window_hours: 2,
    avatar_url: null,
    last_active_date: null,
    last_set_timestamp: null,
  };

  const { error } = await withTimeout(
    "createProfile",
    supabase.from("profiles").insert(newProfile),
    30000,
    signal
  );
  if (error) {
    console.error("[Storage] createProfile ERROR:", error);
    throw error;
  }

  return {
    id: newProfile.id,
    name: newProfile.name,
    avatarUrl: newProfile.avatar_url,
    level: newProfile.level,
    xp: newProfile.xp,
    totalPushUps: newProfile.total_pushups,
    currentStreak: newProfile.current_streak,
    bestStreak: newProfile.best_streak,
    lastActiveDate: newProfile.last_active_date,
    dailyTarget: newProfile.daily_target,
    dailyTargetSets: newProfile.daily_target_sets,
    completionWindowHours: newProfile.completion_window_hours,
    lastSetTimestamp: null,
    targetBreakdown: [],
    email: newProfile.email,
  };
};

export const loadUser = async (
  id: string,
  retryCount = 0,
  signal?: AbortSignal
): Promise<UserProfile | null> => {
  const MAX_RETRIES = 2; // 3回から2回に削減
  const TIMEOUT_MS = 10000; // 15秒から10秒に削減

  console.log(
    `[Storage] loadUser START for id: ${id} (Attempt: ${
      retryCount + 1
    }/${MAX_RETRIES})`
  );

  // 1回目かつ同じIDのリクエストが進行中なら、そのPromiseを返す
  if (retryCount === 0 && inflightUserLoads.has(id)) {
    console.log(
      `[Storage] loadUser: Returning existing inflight promise for ${id}`
    );
    return inflightUserLoads.get(id)!;
  }

  const fetchPromise = (async (): Promise<UserProfile | null> => {
    try {
      // 1. プロフィール取得
      console.log("[Storage] loadUser: Fetching profile...");
      const { data: profileData, error: profileError } = await withTimeout(
        "loadUser:profiles",
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        TIMEOUT_MS,
        signal
      );

      if (profileError) {
        throw profileError; // catchブロックでリトライ判定を行う
      }

      if (!profileData) {
        console.warn("[Storage] loadUser: Profile NOT FOUND.");
        return null;
      }

      console.log("[Storage] loadUser: Profile fetched successfully");

      // 2. 内訳取得
      console.log("[Storage] loadUser: Fetching breakdown...");
      const { data: breakdownData, error: breakdownError } = await withTimeout(
        "loadUser:breakdown",
        supabase
          .from("target_breakdown")
          .select("*")
          .eq("user_id", id)
          .order("sort_order", { ascending: true }),
        TIMEOUT_MS,
        signal
      );

      if (breakdownError) {
        console.warn("[Storage] loadUser (breakdown) ERROR:", breakdownError);
        // breakdown は失敗しても続行可能とする
      }

      return {
        id: profileData.id,
        name: profileData.name || "Unknown",
        avatarUrl: profileData.avatar_url,
        level: profileData.level || 1,
        xp: profileData.xp || 0,
        totalPushUps: profileData.total_pushups || 0,
        currentStreak: profileData.current_streak || 0,
        bestStreak: profileData.best_streak || 0,
        lastActiveDate: profileData.last_active_date,
        dailyTarget: profileData.daily_target || 50,
        dailyTargetSets: profileData.daily_target_sets || 5,
        completionWindowHours: profileData.completion_window_hours || 2,
        lastSetTimestamp: profileData.last_set_timestamp
          ? new Date(profileData.last_set_timestamp).getTime()
          : null,
        targetBreakdown:
          (breakdownData as any[])
            ?.filter((tb): tb is any => !!tb)
            .map((tb) => ({
              id: tb.id,
              level: tb.level || 1,
              variationName: tb.variation_name || "通常",
              count: tb.reps || 0,
            })) || [],
        email: profileData.email || "",
      };
    } catch (e: any) {
      console.warn(
        `[Storage] loadUser Attempt ${retryCount + 1} FAILED:`,
        e.message || e
      );

      if (retryCount < MAX_RETRIES - 1 && !signal?.aborted) {
        const delay = Math.pow(2, retryCount) * 1000; // 指数バックオフ
        console.log(`[Storage] Retrying loadUser in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        return loadUser(id, retryCount + 1, signal);
      }

      console.error("[Storage] loadUser MAX RETRIES reached. Giving up.");
      throw e; // 最大リトライ回数に達したらエラーを投げる
    } finally {
      if (retryCount === 0) {
        inflightUserLoads.delete(id);
      }
    }
  })();

  if (retryCount === 0) {
    inflightUserLoads.set(id, fetchPromise);
  }

  return fetchPromise;
};

export const loadLogs = async (
  userId: string,
  retryCount = 0,
  signal?: AbortSignal
): Promise<DailyLog[]> => {
  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 10000;

  console.log(
    `[Storage] loadLogs START for userId: ${userId} (Attempt: ${
      retryCount + 1
    }/${MAX_RETRIES})`
  );

  if (retryCount === 0 && inflightLogsLoads.has(userId)) {
    console.log(
      `[Storage] loadLogs: Returning existing inflight promise for ${userId}`
    );
    return inflightLogsLoads.get(userId)!;
  }

  const fetchPromise = (async (): Promise<DailyLog[]> => {
    try {
      console.log("[Storage] loadLogs: Fetching daily_logs...");
      const { data: logsData, error: logsError } = await withTimeout(
        "loadLogs:daily_logs",
        supabase
          .from("daily_logs")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false }),
        TIMEOUT_MS,
        signal
      );

      if (logsError) throw logsError;

      console.log("[Storage] loadLogs: daily_logs fetched successfully", {
        count: logsData?.length,
      });

      console.log("[Storage] loadLogs: Fetching workouts...");
      const { data: workoutsData, error: workoutsError } = await withTimeout(
        "loadLogs:workouts",
        supabase
          .from("workouts")
          .select("*")
          .eq("user_id", userId)
          .order("timestamp", { ascending: false }),
        TIMEOUT_MS,
        signal
      );

      if (workoutsError) throw workoutsError;

      console.log("[Storage] loadLogs: workouts fetched successfully", {
        count: workoutsData?.length,
      });

      return (logsData as any[]).map((log) => ({
        date: log.date,
        target: log.target,
        totalCount: log.total_count,
        achieved: log.achieved,
        targetSets: log.target_sets,
        completedSetsCount: log.completed_sets_count,
        sets: (workoutsData || [])
          .filter((w: any) => {
            if (!w.timestamp) return false;
            // ワークアウトの時刻から「論理的な日付」を算出し、ログの日付と一致するか確認
            return getLogicalDateStr(w.timestamp) === log.date;
          })
          .map((w: any) => ({
            id: w.id,
            count: w.count,
            timestamp: w.timestamp
              ? new Date(w.timestamp).getTime()
              : Date.now(),
            variationName: w.variation_name,
          })),
      }));
    } catch (e: any) {
      console.warn(
        `[Storage] loadLogs Attempt ${retryCount + 1} FAILED:`,
        e.message || e
      );

      if (retryCount < MAX_RETRIES - 1 && !signal?.aborted) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`[Storage] Retrying loadLogs in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        return loadLogs(userId, retryCount + 1, signal);
      }

      console.error("[Storage] loadLogs MAX RETRIES reached. Giving up.");
      throw e;
    } finally {
      if (retryCount === 0) {
        inflightLogsLoads.delete(userId);
      }
    }
  })();

  if (retryCount === 0) {
    inflightLogsLoads.set(userId, fetchPromise);
  }

  return fetchPromise;
};

export const insertWorkout = async (userId: string, set: PushUpSet) => {
  const { error } = await supabase.from("workouts").insert({
    user_id: userId,
    count: set.count,
    variation_name: set.variationName,
    timestamp: new Date(set.timestamp).toISOString(),
  });

  if (error) throw error;
};

export const upsertDailyLog = async (userId: string, log: DailyLog) => {
  const { error } = await supabase.from("daily_logs").upsert(
    {
      user_id: userId,
      date: log.date,
      target: log.target,
      total_count: log.totalCount,
      achieved: log.achieved,
      target_sets: log.targetSets,
      completed_sets_count: log.completedSetsCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" }
  );

  if (error) throw error;
};

export const updateTargetBreakdown = async (
  userId: string,
  items: TargetItem[]
) => {
  // 1. 既存の設定を削除
  const { error: deleteError } = await supabase
    .from("target_breakdown")
    .delete()
    .eq("user_id", userId);

  if (deleteError) throw deleteError;

  // 2. 新しい設定を挿入
  if (items.length > 0) {
    const { error: insertError } = await supabase
      .from("target_breakdown")
      .insert(
        items.map((item, index) => ({
          user_id: userId,
          variation_name: item.variationName,
          reps: item.count,
          level: item.level,
          sort_order: index,
        }))
      );

    if (insertError) throw insertError;
  }
};

/**
 * 現在時刻に基づいた「論理的な日付」を返す (朝4時リセット)
 */
export const getTodayStr = (date = new Date()) => {
  const d = new Date(date);
  // 朝4時未満なら、日付を1日戻す
  if (d.getHours() < 4) {
    d.setDate(d.getDate() - 1);
  }
  return d.toISOString().split("T")[0];
};

/**
 * 任意のタイムスタンプが、どの「論理的な日付」に属するかを判定する
 */
export const getLogicalDateStr = (timestamp: number | string) => {
  return getTodayStr(new Date(timestamp));
};

export const getOrCreateTodayLog = (
  logs: DailyLog[],
  user: UserProfile
): { logs: DailyLog[]; todayLog: DailyLog } => {
  const today = getTodayStr();
  const existingIndex = logs.findIndex((l) => l.date === today);

  if (existingIndex !== -1) {
    return { logs, todayLog: logs[existingIndex] };
  }

  const newLog: DailyLog = {
    date: today,
    sets: [],
    target: user.dailyTarget,
    totalCount: 0,
    achieved: false,
    targetSets: user.dailyTargetSets,
    completedSetsCount: 0,
  };

  return { logs: [newLog, ...logs], todayLog: newLog };
};

export const exportToCSV = (logs: DailyLog[]) => {
  const header = [
    "Date",
    "Total Count",
    "Target",
    "Achieved",
    "Sets Details",
  ].join(",");
  const rows = logs.map((log) => {
    const setsDetails = log.sets.map((s) => `${s.count}`).join("|");
    return [
      log.date,
      log.totalCount,
      log.target,
      log.achieved ? "Yes" : "No",
      `"${setsDetails}"`,
    ].join(",");
  });

  return [header, ...rows].join("\n");
};

export const downloadCSV = (logs: DailyLog[]) => {
  const csvContent = exportToCSV(logs);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `pushup_senkai_data_${getTodayStr()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
