import { DailyLog, UserProfile } from "@/types/types";
import { Copy, Share2 } from "lucide-react";
import React, { useRef } from "react";

interface ShareProps {
  user: UserProfile;
  todayLog: DailyLog;
}

const ShareView: React.FC<ShareProps> = ({ user, todayLog }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopyText = () => {
    const text = `【研鑽(kenzan)-腕立て】
本日：${todayLog.totalCount}回完了！🔥
現在の継続：${user.currentStreak}日
プレイヤーLv.${user.level}
累計腕立て：${user.totalPushUps}回
#研鑽腕立て #腕立て伏せ #筋トレ`;
    navigator.clipboard.writeText(text);
    alert("実績をコピーしました！");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black italic senkai-gradient text-transparent-clip text-center">
        本日のリザルト
      </h2>

      {/* Share Card Visual */}
      <div ref={cardRef} className="result-card">
        <div className="result-card-stripe"></div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-4xl font-black italic text-white tracking-tighter">
              SUCCESS
            </h3>
            <p className="text-amber-500 font-bold text-sm tracking-widest">
              {todayLog.date.replace(/-/g, "/")}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-zinc-300">
            RANK: SSS
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
              Total Pushups Today
            </p>
            <p className="text-7xl font-black italic tabular-nums senkai-gradient text-transparent-clip">
              {todayLog.totalCount}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase">
                Streak
              </p>
              <p className="text-xl font-black">{user.currentStreak} Days</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase">
                Level
              </p>
              <p className="text-xl font-black">MASTER Lv.{user.level}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-zinc-800 pt-6">
          <span className="text-[10px] font-black text-zinc-600 tracking-tighter italic">
            @KENZAN_UDATATE
          </span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleCopyText} className="counter-clear-button">
          <Copy size={20} /> テキスト
        </button>
        <button
          onClick={() =>
            alert(
              "画像保存機能は開発中です。スクリーンショットを撮影してください！"
            )
          }
          className="auth-submit-button senkai-gradient"
        >
          <Share2 size={20} /> 共有する
        </button>
      </div>

      <div className="text-center p-4">
        <p className="text-zinc-500 text-xs italic">
          「このカードをYouTubeやSNSに投稿して、あなたの努力を世界に見せつけよう。」
        </p>
      </div>
    </div>
  );
};

export default ShareView;
