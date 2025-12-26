import { downloadCSV } from "@/lib/storage";
import { DailyLog, UserProfile } from "@/types/types";
import {
  Activity,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Globe,
  MapPin,
  Mountain,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface StatsProps {
  user: UserProfile;
  logs: DailyLog[];
  totalPushUps: number;
}

type TimeRange = "7d" | "14d" | "30d" | "90d" | "all";
type RankingView = "rank" | "percentile";

const StatsView: React.FC<StatsProps> = ({ user, logs, totalPushUps }) => {
  const [range, setRange] = useState<TimeRange>("14d");
  const [rankingView, setRankingView] = useState<RankingView>("rank");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    new Date().toISOString().split("T")[0]
  );

  const filteredLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    switch (range) {
      case "7d":
        return sorted.slice(-7);
      case "14d":
        return sorted.slice(-14);
      case "30d":
        return sorted.slice(-30);
      case "90d":
        return sorted.slice(-90);
      case "all":
        return sorted;
      default:
        return sorted.slice(-14);
    }
  }, [logs, range]);

  const chartData = useMemo(() => {
    return filteredLogs.map((log) => ({
      name: log.date.split("-").slice(1).join("/"),
      fullDate: log.date,
      count: log.totalCount,
      target: log.target,
      status: log.achieved ? "success" : "fail",
    }));
  }, [filteredLogs]);

  const statsSummary = useMemo(() => {
    const activeDays = logs.length || 1;
    const totalCount = logs.reduce((acc, l) => acc + l.totalCount, 0);
    const avgCount = Math.round(totalCount / activeDays);
    const maxCount =
      logs.length > 0 ? Math.max(...logs.map((l) => l.totalCount)) : 0;
    return { totalCount, avgCount, maxCount, activeDays };
  }, [logs]);

  // World Ranking Logic
  const rankingInfo = useMemo(() => {
    const TOTAL_POPULATION = 8000000000;
    const avg = statsSummary.avgCount;
    const streak = user.currentStreak;

    // Power index: blend of volume and consistency
    const power = avg * (1 + streak * 0.05);

    // Percentile logic: logarithmic decay to simulate global ranking
    let percentile = 100;
    if (power > 0) {
      percentile = 50 * Math.exp(-0.01 * power);
    }

    // Floor the percentile for very high values
    percentile = Math.max(percentile, 0.00001);

    const rank = Math.floor((percentile / 100) * TOTAL_POPULATION);

    return {
      percentile: percentile.toFixed(4),
      rank: rank.toLocaleString(),
      power: Math.floor(power),
    };
  }, [statsSummary.avgCount, user.currentStreak]);

  // Calendar Logic
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const getLogForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return logs.find((l) => l.date === dateStr);
  };

  const selectedLog = useMemo(() => {
    return logs.find((l) => l.date === selectedDate);
  }, [logs, selectedDate]);

  const variationSummary = useMemo(() => {
    if (!selectedLog) return null;
    const summary: Record<string, { count: number; sets: number }> = {};
    selectedLog.sets.forEach((set) => {
      const vName = set.variationName || "通常腕立て";
      if (!summary[vName]) summary[vName] = { count: 0, sets: 0 };
      summary[vName].count += set.count;
      summary[vName].sets += 1;
    });
    return Object.entries(summary).sort((a, b) => b[1].count - a[1].count);
  }, [selectedLog]);

  // Comparisons
  const mtFujiReps = 3776 / 0.5;
  const mtFujiProgress = (totalPushUps / mtFujiReps) * 100;
  const everestReps = 8848 / 0.5;
  const everestProgress = (totalPushUps / everestReps) * 100;
  const burjKhalifaReps = 828 / 0.5;
  const burjProgress = (totalPushUps / burjKhalifaReps) * 100;

  const rangeButtons: { label: string; value: TimeRange }[] = [
    { label: "7日", value: "7d" },
    { label: "14日", value: "14d" },
    { label: "30日", value: "30d" },
    { label: "90日", value: "90d" },
    { label: "全", value: "all" },
  ];

  const handleMonthChange = (offset: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1)
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black italic senkai-gradient text-transparent-clip">
          成長の記録
        </h2>
        <button
          onClick={() => downloadCSV(logs)}
          className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 border border-zinc-800 hover:text-white active:scale-95 transition-all"
        >
          <Download size={14} /> CSV
        </button>
      </div>

      {/* World Ranking Dashboard with Tab Switcher */}
      <div className="stats-dashboard group">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Globe size={120} className="text-amber-500" />
        </div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2 text-zinc-500">
            <Trophy size={18} className="text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-widest italic">
              世界番付 (World Ranking)
            </h3>
          </div>

          {/* Ranking Switcher Tab */}
          <div className="stats-tab-group">
            <button
              onClick={() => setRankingView("rank")}
              className={`stats-tab-button ${
                rankingView === "rank"
                  ? "stats-tab-button--active"
                  : "stats-tab-button--inactive"
              }`}
            >
              <Users size={14} />
            </button>
            <button
              onClick={() => setRankingView("percentile")}
              className={`stats-tab-button ${
                rankingView === "percentile"
                  ? "stats-tab-button--active"
                  : "stats-tab-button--inactive"
              }`}
            >
              <Zap size={14} />
            </button>
          </div>
        </div>

        {/* Dynamic Display based on Tab */}
        <div className="min-h-[100px] mb-8 relative z-10 animate-in fade-in zoom-in-95 duration-300">
          {rankingView === "rank" ? (
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Users size={12} /> 推定世界順位
              </p>
              <p className="text-4xl font-black italic tabular-nums text-white truncate">
                <span className="text-amber-500 mr-1">#</span>
                {rankingInfo.rank}
              </p>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                Total Population: 8,000,000,000
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Zap size={12} /> 上位パーセンテージ
              </p>
              <p className="text-4xl font-black italic tabular-nums text-amber-500">
                {rankingInfo.percentile}
                <span className="text-xl not-italic ml-1">%</span>
              </p>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                Status: Ranked as Elite
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-800/50 relative z-10">
          <div className="bg-zinc-800/40 p-4 rounded-2xl border border-zinc-800/50">
            <p className="text-[9px] text-zinc-500 font-bold uppercase mb-1 flex items-center gap-1">
              <Activity size={10} /> 1日平均
            </p>
            <p className="text-xl font-black italic tabular-nums text-white">
              {statsSummary.avgCount}{" "}
              <span className="text-[10px] not-italic text-zinc-500">REPS</span>
            </p>
          </div>
          <div className="bg-zinc-800/40 p-4 rounded-2xl border border-zinc-800/50">
            <p className="text-[9px] text-zinc-500 font-bold uppercase mb-1 flex items-center gap-1">
              <TrendingUp size={10} /> 継続日数
            </p>
            <p className="text-xl font-black italic tabular-nums text-orange-500">
              {user.currentStreak}{" "}
              <span className="text-[10px] not-italic text-zinc-500">DAYS</span>
            </p>
          </div>
        </div>
      </div>

      {/* Range Selector */}
      <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800 gap-1">
        {rangeButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setRange(btn.value)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              range === btn.value
                ? "bg-zinc-800 text-amber-500 shadow-lg"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Chart Card */}
      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 h-64 shadow-inner relative overflow-hidden group flex flex-col">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 p-4 pb-0 flex items-center gap-2">
          <Activity size={14} /> パフォーマンス推移
        </h3>
        <div className="flex-1 w-full min-h-0 container-for-chart px-2 pb-2">
          <ResponsiveContainer width="99%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#333"
              />
              <XAxis
                dataKey="name"
                stroke="#666"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(chartData.length / 7)}
              />
              <YAxis
                stroke="#666"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                labelFormatter={(label, payload) =>
                  payload[0]?.payload.fullDate || label
                }
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count >= entry.target ? "#f59e0b" : "#444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="settings-section-card">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <CalendarIcon size={14} /> 修行カレンダー
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-sm font-black italic">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleMonthChange(-1)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => handleMonthChange(1)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="calendar-grid">
          {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
            <div
              key={d}
              className="text-center text-[9px] font-black text-zinc-600 uppercase py-2"
            >
              {d}
            </div>
          ))}
          {calendarDays.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} />;
            const log = getLogForDate(date);
            const dateStr = date.toISOString().split("T")[0];
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toISOString().split("T")[0] === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`calendar-day-button ${
                  isSelected ? "border-amber-500 bg-amber-500/10" : ""
                }`}
              >
                <span
                  className={`text-[10px] font-bold ${
                    isToday ? "text-amber-500" : "text-zinc-400"
                  }`}
                >
                  {date.getDate()}
                </span>
                {log && (
                  <div
                    className={`mt-1 w-1.5 h-1.5 rounded-full ${
                      log.achieved
                        ? "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]"
                        : "bg-zinc-600"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Date Breakdown */}
        <div className="bg-zinc-800/30 rounded-2xl p-4 border border-zinc-700/50">
          {selectedLog ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-end border-b border-zinc-700/50 pb-3">
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    {selectedDate?.replace(/-/g, "/")}
                  </p>
                  <h4 className="text-lg font-black italic">一日の戦果</h4>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black italic text-amber-500">
                      {selectedLog.totalCount}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">
                      REPS
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase">
                    {selectedLog.sets.length} SETS COMPLETED
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {variationSummary?.map(([name, stats]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-500/60">
                        <Zap size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white">
                          {name}
                        </p>
                        <p className="text-[8px] text-zinc-500 font-bold uppercase">
                          {stats.sets} SETS
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black italic">
                        {stats.count}{" "}
                        <span className="text-[8px] not-italic text-zinc-600">
                          REPS
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedLog.achieved && (
                <div className="pt-2 flex items-center gap-2 text-amber-500">
                  <CheckCircle2 size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">
                    Mission Accomplished
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                この日は修行が行われていません
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Comparisons Grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-8">
        <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2">
          <Globe size={16} />
          <h3 className="text-xs font-black uppercase tracking-widest">
            物理限界・比較
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">
              高度到達レベル (垂直リフト換算)
            </p>

            <div className="space-y-4">
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-300">
                      ブルジュ・ハリファ (828m)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-500">
                    {Math.floor(burjProgress)}%
                  </span>
                </div>
                <div className="comparison-bar-container">
                  <div
                    className="h-full bg-amber-500 transition-all duration-1000"
                    style={{ width: `${Math.min(burjProgress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <Mountain size={14} className="text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-300">
                      エベレスト (8848m)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-500">
                    {Math.floor(everestProgress)}%
                  </span>
                </div>
                <div className="comparison-bar-container">
                  <div
                    className="h-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${Math.min(everestProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 text-center">
        <p className="text-[10px] text-zinc-600 italic">
          「一日の戦果が、一生の肉体を作る。」
        </p>
      </div>
    </div>
  );
};

// Add missing icon import manually inside this file or reference from parent
const CheckCircle2 = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default StatsView;
