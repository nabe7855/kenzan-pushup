import { VARIATIONS } from "@/constants/constants";
import { Award, ChevronDown, ChevronUp, Star } from "lucide-react";
import React, { useState } from "react";

const VariationsView: React.FC = () => {
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>(
    {
      1: true,
      2: true,
      3: false,
      4: false,
    }
  );

  const toggleLevel = (lv: number) => {
    setExpandedLevels((prev) => ({ ...prev, [lv]: !prev[lv] }));
  };

  const getLevelLabel = (lv: number) => {
    switch (lv) {
      case 1:
        return {
          name: "初級 (Beginner)",
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          tag: "基礎習得",
        };
      case 2:
        return {
          name: "中級 (Intermediate)",
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          tag: "筋力増強",
        };
      case 3:
        return {
          name: "上級 (Advanced)",
          color: "text-red-400",
          bg: "bg-red-500/10",
          tag: "全身連動",
        };
      case 4:
        return {
          name: "超上級 (Elite/Maniac)",
          color: "text-zinc-100",
          bg: "bg-zinc-100/10",
          tag: "人間超越",
        };
      default:
        return {
          name: "未知",
          color: "text-zinc-500",
          bg: "bg-zinc-500/10",
          tag: "未定義",
        };
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-2">
        <h2 className="text-2xl font-black italic senkai-gradient text-transparent-clip">
          修行の種類と極意
        </h2>
        <p className="text-zinc-500 text-xs font-bold leading-relaxed">
          千回への道は、単調な繰り返しではありません。
          <br />
          多種多様な28以上の極意で筋肉に新たな刺激を与え、肉体の限界を突破しましょう。
        </p>
      </div>

      <div className="space-y-6">
        {[1, 2, 3, 4].map((lv) => {
          const config = getLevelLabel(lv);
          const isOpen = expandedLevels[lv];
          const levelVariations = VARIATIONS.filter((v) => v.level === lv);

          return (
            <div key={lv} className="space-y-3">
              <button
                onClick={() => toggleLevel(lv)}
                className={`variation-item-card ${config.bg}`}
              >
                <div className="flex items-center gap-3">
                  <Star
                    size={18}
                    className={config.color}
                    fill="currentColor"
                  />
                  <div className="text-left">
                    <span
                      className={`block font-black italic uppercase tracking-tighter ${config.color}`}
                    >
                      Level {lv}: {config.name}
                    </span>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                      {config.tag}
                    </span>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp size={16} className="text-zinc-500" />
                ) : (
                  <ChevronDown size={16} className="text-zinc-500" />
                )}
              </button>

              {isOpen && (
                <div className="space-y-3 px-1">
                  {levelVariations.map((v, i) => (
                    <div
                      key={i}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 group hover:border-amber-500/50 transition-all shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center shadow-inner border border-zinc-700/50">
                            {v.icon}
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-white">
                              {v.name}
                            </h3>
                            <div className="flex gap-0.5 mt-1">
                              {[...Array(10)].map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`w-1 h-2 rounded-full ${
                                    idx < v.difficulty
                                      ? lv === 4
                                        ? "bg-zinc-100 shadow-[0_0_5px_white]"
                                        : "bg-amber-500"
                                      : "bg-zinc-800"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-[10px] mb-3 font-medium leading-relaxed italic border-l-2 border-zinc-800 pl-3">
                        {v.desc}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-md border border-zinc-700/50">
                          Focus: {v.focus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 text-center relative overflow-hidden">
        <div className="variation-divider"></div>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
          <Award size={12} /> 極意の習得
        </p>
        <p className="text-xs text-zinc-400 leading-relaxed italic">
          「形を変えれば、筋肉は驚き、成長する。
          <br />
          千回を単なる数字にせず、百の技で肉体を刻め。」
        </p>
      </div>
    </div>
  );
};

export default VariationsView;
