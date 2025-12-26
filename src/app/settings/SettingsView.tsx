import { VARIATIONS } from "@/constants/constants";
import { TargetItem, UserProfile } from "@/types/types";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  ListChecks,
  Loader2,
  LogOut,
  Plus,
  Save,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import React, { useMemo, useState } from "react";

interface SettingsProps {
  user: UserProfile;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsProps> = ({ user, onSave, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [targetBreakdown, setTargetBreakdown] = useState<TargetItem[]>(
    user.targetBreakdown || []
  );
  const [dailyTargetSets, setDailyTargetSets] = useState(
    user.dailyTargetSets || 1
  );
  const [completionWindowHours, setCompletionWindowHours] = useState(
    user.completionWindowHours || 12
  );
  const [isSaving, setIsSaving] = useState(false);

  const setReps = useMemo(() => {
    return targetBreakdown.reduce((sum, item) => sum + item.count, 0);
  }, [targetBreakdown]);

  const totalDailyTarget = useMemo(() => {
    return setReps * dailyTargetSets;
  }, [setReps, dailyTargetSets]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        name,
        targetBreakdown,
        dailyTargetSets,
        completionWindowHours,
        dailyTarget: totalDailyTarget > 0 ? totalDailyTarget : user.dailyTarget,
      });
      alert("設定を保存しました");
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("設定の保存に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  const addTargetItem = () => {
    const defaultLevel = 1;
    const availableVariations = VARIATIONS.filter(
      (v) => v.level === defaultLevel
    );
    const newItem: TargetItem = {
      id: Math.random().toString(36).substr(2, 9),
      level: defaultLevel,
      variationName: availableVariations[0].name,
      count: 10,
    };
    setTargetBreakdown([...targetBreakdown, newItem]);
  };

  const removeTargetItem = (id: string) => {
    setTargetBreakdown(targetBreakdown.filter((item) => item.id !== id));
  };

  const updateTargetItem = (id: string, updates: Partial<TargetItem>) => {
    setTargetBreakdown(
      targetBreakdown.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };

        if (updates.level) {
          const firstVar = VARIATIONS.find((v) => v.level === updates.level);
          if (firstVar) {
            updated.variationName = firstVar.name;
          }
        }
        return updated;
      })
    );
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    const index = targetBreakdown.findIndex((item) => item.id === id);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      const newItems = [...targetBreakdown];
      [newItems[index - 1], newItems[index]] = [
        newItems[index],
        newItems[index - 1],
      ];
      setTargetBreakdown(newItems);
    } else if (direction === "down" && index < targetBreakdown.length - 1) {
      const newItems = [...targetBreakdown];
      [newItems[index + 1], newItems[index]] = [
        newItems[index],
        newItems[index + 1],
      ];
      setTargetBreakdown(newItems);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black italic senkai-gradient text-transparent-clip">
        各種設定
      </h2>

      <div className="space-y-4">
        {/* Profile */}
        <div className="settings-section-card">
          <div className="flex items-center gap-2 text-zinc-500 mb-4">
            <UserIcon size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">
              プロフィール
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                ニックネーム
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="settings-input"
              />
            </div>
            {user.email && (
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                  メールアドレス
                </label>
                <p className="text-sm font-bold text-zinc-400 px-1">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule & Sets */}
        <div className="settings-section-card">
          <div className="flex items-center gap-2 text-zinc-500 mb-4">
            <Layers size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">
              1日のトレーニング計画
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">
                  1日の目標セット数
                </label>
                <span className="text-amber-500 font-black italic">
                  {dailyTargetSets} sets
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={dailyTargetSets}
                onChange={(e) => setDailyTargetSets(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">
                  目標完遂までの時間 (h)
                </label>
                <span className="text-amber-500 font-black italic">
                  {completionWindowHours} hours
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={completionWindowHours}
                onChange={(e) =>
                  setCompletionWindowHours(parseInt(e.target.value))
                }
                className="settings-slider"
              />
            </div>

            <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50 flex items-center gap-3">
              <Clock className="text-zinc-500" size={20} />
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">
                  計算されたセット間隔
                </p>
                <p className="text-lg font-black text-white italic">
                  約{" "}
                  {Math.floor((completionWindowHours * 60) / dailyTargetSets)}{" "}
                  分
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Target Breakdown */}
        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-zinc-500">
              <ListChecks size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">
                1セットの内訳
              </span>
            </div>
            <button
              onClick={addTargetItem}
              className="p-2 bg-amber-500/10 text-amber-500 rounded-full hover:bg-amber-500/20 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {targetBreakdown.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-2xl">
                <p className="text-zinc-600 text-[10px] font-bold uppercase">
                  内訳が設定されていません
                </p>
                <p className="text-zinc-700 text-[9px] mt-1">
                  「+」ボタンで追加してください
                </p>
              </div>
            ) : (
              targetBreakdown.map((item) => (
                <div key={item.id} className="target-item-card">
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      onClick={() => moveItem(item.id, "up")}
                      className="p-1.5 text-zinc-600 hover:text-amber-500 transition-colors"
                      title="上へ"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveItem(item.id, "down")}
                      className="p-1.5 text-zinc-600 hover:text-amber-500 transition-colors"
                      title="下へ"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      onClick={() => removeTargetItem(item.id)}
                      className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors"
                      title="削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-1">
                        カテゴリー
                      </label>
                      <select
                        value={item.level}
                        onChange={(e) =>
                          updateTargetItem(item.id, {
                            level: parseInt(e.target.value),
                          })
                        }
                        className="settings-select"
                      >
                        <option value={1}>Lv1: 初級</option>
                        <option value={2}>Lv2: 中級</option>
                        <option value={3}>Lv3: 上級</option>
                        <option value={4}>Lv4: 超上級</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-1">
                        種目
                      </label>
                      <select
                        value={item.variationName}
                        onChange={(e) =>
                          updateTargetItem(item.id, {
                            variationName: e.target.value,
                          })
                        }
                        className="settings-select"
                      >
                        {VARIATIONS.filter((v) => v.level === item.level).map(
                          (v) => (
                            <option key={v.name} value={v.name}>
                              {v.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-1">
                      目標回数
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="5"
                        max="300"
                        step="5"
                        value={item.count}
                        onChange={(e) =>
                          updateTargetItem(item.id, {
                            count: parseInt(e.target.value),
                          })
                        }
                        className="settings-slider"
                      />
                      <span className="text-sm font-black italic tabular-nums w-8 text-right text-amber-500">
                        {item.count}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                1セットの合計
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black italic tabular-nums text-white">
                  {setReps}
                </span>
                <span className="text-zinc-500 text-[10px] font-bold uppercase">
                  REPS
                </span>
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                1日の最終目標
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black italic tabular-nums text-amber-500">
                  {totalDailyTarget}
                </span>
                <span className="text-zinc-500 text-[10px] font-bold uppercase">
                  TOTAL REPS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 flex justify-between items-center opacity-50 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">プッシュ通知</p>
              <p className="text-[10px] text-zinc-500">
                リマインド機能を有効化
              </p>
            </div>
          </div>
          <div className="w-12 h-6 bg-zinc-700 rounded-full relative cursor-not-allowed">
            <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-500 rounded-full"></div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="auth-submit-button senkai-gradient disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
          )}{" "}
          {isSaving ? "保存中..." : "変更を保存"}
        </button>

        <button
          onClick={onLogout}
          className="counter-clear-button text-red-500"
        >
          <LogOut size={20} /> ログアウト
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
