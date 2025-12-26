
import React from 'react';
import { Achievement } from '@/types/types';
// Add missing Fingerprint import from lucide-react to fix the error on line 223
import { 
  ArrowUpRight, Construction, Baby, Shield, 
  Target as TargetIcon, MoveHorizontal, Minimize2, 
  Gem, ArrowDownRight, Compass, Dumbbell, 
  Waves, Orbit, Bug, Sword, Keyboard, 
  MousePointer2, Hand, PersonStanding, Flame, 
  Star, Zap, Plane, Mountain, Fingerprint
} from 'lucide-react';

export const INITIAL_DAILY_TARGET = 100;
export const XP_PER_PUSHUP = 1;

export interface Variation {
  name: string;
  desc: string;
  difficulty: number;
  level: number;
  focus: string;
  icon: React.ReactNode;
}

export const VARIATIONS: Variation[] = [
  // Level 1: Beginner
  {
    name: "ウォール・プッシュアップ",
    desc: "壁に向かって立ち、立ったまま行う最も負荷の軽い種目。初心者の導入に最適。",
    difficulty: 1,
    level: 1,
    focus: "胸部全体（導入）",
    icon: <ArrowUpRight size={20} className="text-blue-300" />
  },
  {
    name: "インクライン",
    desc: "椅子や台に手を置いて行う。角度がつくため床よりも負荷が軽く、フォーム習得に向く。",
    difficulty: 1,
    level: 1,
    focus: "大胸筋下部",
    icon: <Construction size={20} className="text-blue-300" />
  },
  {
    name: "ニーリング (膝つき)",
    desc: "床で膝をついて行う。通常の腕立て伏せへの第一歩として最も汎用性が高い。",
    difficulty: 2,
    level: 1,
    focus: "胸部 / 三頭筋",
    icon: <Baby size={20} className="text-blue-400" />
  },
  {
    name: "ニーリング・ワイド",
    desc: "膝をついた状態で手幅を広げて行う。大胸筋への意識を高める練習に最適。",
    difficulty: 2,
    level: 1,
    focus: "大胸筋外側",
    icon: <Shield size={20} className="text-blue-400" />
  },
  
  // Level 2: Intermediate
  {
    name: "ノーマル",
    desc: "基本の腕立て伏せ。肩幅よりやや広く手をつく、全ての基準となる種目。",
    difficulty: 3,
    level: 2,
    focus: "胸部 / 三頭筋 / 肩",
    icon: <TargetIcon size={20} className="text-emerald-400" />
  },
  {
    name: "ワイド",
    desc: "手幅を肩幅の1.5〜2倍に広げる。大胸筋（特に外側）への負荷が高い。",
    difficulty: 4,
    level: 2,
    focus: "大胸筋外側",
    icon: <MoveHorizontal size={20} className="text-emerald-400" />
  },
  {
    name: "ナロー (クローズ)",
    desc: "手幅を肩幅より狭くする。上腕三頭筋（二の腕）と大胸筋内側に効く。",
    difficulty: 4,
    level: 2,
    focus: "上腕三頭筋 / 大胸筋内側",
    icon: <Minimize2 size={20} className="text-emerald-500" />
  },
  {
    name: "ダイヤモンド",
    desc: "人差し指と親指でひし形を作って行う。三頭筋への負荷が極めて高い。",
    difficulty: 5,
    level: 2,
    focus: "上腕三頭筋",
    icon: <Gem size={20} className="text-emerald-500" />
  },
  {
    name: "デクライン",
    desc: "足を椅子や台に乗せて行う。大胸筋上部と三角筋前部に強烈に効く。",
    difficulty: 5,
    level: 2,
    focus: "大胸筋上部 / 三角筋",
    icon: <ArrowDownRight size={20} className="text-emerald-500" />
  },
  {
    name: "リバースハンド",
    desc: "指先を足の方に向けて行う。上腕二頭筋や前腕への関与が増える特殊フォーム。",
    difficulty: 6,
    level: 2,
    focus: "上腕二頭筋 / 前腕",
    icon: <Compass size={20} className="text-emerald-600" />
  },
  {
    name: "ナックル (拳立て)",
    desc: "拳を握って行う。手首の保護や前腕の強化、格闘技の実践向け。",
    difficulty: 6,
    level: 2,
    focus: "前腕 / 手首 / 拳",
    icon: <Dumbbell size={20} className="text-emerald-600" />
  },

  // Level 3: Advanced
  {
    name: "ヒンズー",
    desc: "体を反らせながら円を描くように動く。柔軟性と全身の連動性を鍛える。",
    difficulty: 7,
    level: 3,
    focus: "肩 / 背中 / 全身",
    icon: <Waves size={20} className="text-red-400" />
  },
  {
    name: "ダイブボンバー",
    desc: "ヒンズーに似ているが、元の軌道を逆再生して戻るため、さらに負荷が高い。",
    difficulty: 8,
    level: 3,
    focus: "全身の筋持久力",
    icon: <Orbit size={20} className="text-red-400" />
  },
  {
    name: "スパイダーマン",
    desc: "体を下ろすと同時に片膝を肘に近づける。腹斜筋も同時に鍛えられる。",
    difficulty: 7,
    level: 3,
    focus: "胸部 / 腹斜筋",
    icon: <Bug size={20} className="text-red-500" />
  },
  {
    name: "アーチャー",
    desc: "弓を引くように片腕を横に伸ばし、もう片方の腕に体重を乗せる。片手への布石。",
    difficulty: 7,
    level: 3,
    focus: "片腕出力 / 体幹",
    icon: <Sword size={20} className="text-red-500" />
  },
  {
    name: "タイプライター",
    desc: "体を沈めた状態で左右にスライド移動する。大胸筋への持続的な負荷が特徴。",
    difficulty: 8,
    level: 3,
    focus: "大胸筋（持続負荷）",
    icon: <Keyboard size={20} className="text-red-600" />
  },
  {
    name: "アンイーブン",
    desc: "片手をボールや段差に乗せて高さを変えて行う。左右非対称の刺激を与える。",
    difficulty: 7,
    level: 3,
    focus: "深層筋 / バランス",
    icon: <MousePointer2 size={20} className="text-red-600" />
  },
  {
    name: "スタッガード",
    desc: "片手を前、片手を後ろにずらして置く。縦方向の刺激変化を楽しむ。",
    difficulty: 7,
    level: 3,
    focus: "三頭筋 / 肩（前後差）",
    icon: <Waves size={20} className="text-red-600" />
  },
  {
    name: "クラップ",
    desc: "体を強く押し上げ空中で手を叩く。爆発的な瞬発力を鍛える。",
    difficulty: 8,
    level: 3,
    focus: "瞬発力 / 爆発的パワー",
    icon: <Hand size={20} className="text-purple-400" />
  },

  // Level 4: Elite / Maniac
  {
    name: "ワンアーム (足開き)",
    desc: "片手で行う。足を開いてバランスを取る、片手腕立てのスタンダード。",
    difficulty: 9,
    level: 4,
    focus: "圧倒的片腕筋力",
    icon: <PersonStanding size={20} className="text-zinc-100" />
  },
  {
    name: "ワンアーム (足閉じ)",
    desc: "足を閉じて行う。体幹の回旋を抑える強烈な体幹力とバランスが必要。",
    difficulty: 10,
    level: 4,
    focus: "体幹 / 極限のバランス",
    icon: <Flame size={20} className="text-orange-500" />
  },
  {
    name: "ワンアーム・ワンレッグ",
    desc: "片手かつ片足で行う。支持基底面が最小になり、難易度は最大級。",
    difficulty: 10,
    level: 4,
    focus: "全身の連動 / 極点",
    icon: <Star size={20} className="text-yellow-400" />
  },
  {
    name: "レバー・プッシュアップ",
    desc: "片腕を横に伸ばし、もう片方の腕だけで上下する。ほぼ片手腕立ての強度。",
    difficulty: 9,
    level: 4,
    focus: "大胸筋 / 体幹側部",
    icon: <Shield size={20} className="text-zinc-300" />
  },
  {
    name: "フィンガーチップ",
    desc: "指立て伏せ。指の強度と前腕の極限的な強化が必要。怪我に注意。",
    difficulty: 9,
    level: 4,
    focus: "前腕 / 指の強度",
    icon: <Fingerprint size={20} className="text-zinc-400" />
  },
  {
    name: "プランシェ (疑似含む)",
    desc: "足を浮かせる、または重心を前に倒す。自重における最高峰の難度。",
    difficulty: 10,
    level: 4,
    focus: "肩 / 体幹 / 全身",
    icon: <Zap size={20} className="text-blue-400" />
  },
  {
    name: "スーパーマン",
    desc: "全身を空中に飛ばし、手足を前後に伸ばす。圧倒的な爆発力と滞空能力。",
    difficulty: 10,
    level: 4,
    focus: "プライオメトリクス",
    icon: <Plane size={20} className="text-zinc-100" />
  },
  {
    name: "アズテック",
    desc: "空中で手とつま先をタッチする爆発的種目。最高クラスの瞬発力。",
    difficulty: 10,
    level: 4,
    focus: "腹筋 / 瞬発力",
    icon: <Zap size={20} className="text-red-500" />
  },
  {
    name: "ハンドスタンド (倒立)",
    desc: "壁倒立、または自立倒立した状態で行う。肩への最大負荷。",
    difficulty: 10,
    level: 4,
    focus: "三角筋 / 三頭筋",
    icon: <Mountain size={20} className="text-white" />
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    title: '最初の一歩',
    description: '累計100回達成',
    icon: '👣',
    condition: (user) => user.totalPushUps >= 100,
  },
  {
    id: 'senkai-novice',
    title: '千回の卵',
    description: '累計1,000回達成',
    icon: '🐣',
    condition: (user) => user.totalPushUps >= 1000,
  },
  {
    id: 'senkai-master',
    title: '千回の達人',
    description: '累計10,000回達成',
    icon: '🐲',
    condition: (user) => user.totalPushUps >= 10000,
  },
  {
    id: 'streak-7',
    title: '一週間の奇跡',
    description: '7日連続達成',
    icon: '🔥',
    condition: (user) => user.bestStreak >= 7,
  },
  {
    id: 'one-day-1000',
    title: '千回超越',
    description: '1日で1,000回達成',
    icon: '⚡',
    condition: (user, logs) => logs.some(log => log.totalCount >= 1000),
  },
  {
    id: 'early-bird',
    title: '早起きの武士',
    description: '午前8時前に100回完了',
    icon: '🌅',
    condition: (user, logs) => {
      return logs.some(log => {
        const earlySets = log.sets.filter(s => {
          const date = new Date(s.timestamp);
          return date.getHours() < 8;
        });
        const earlyTotal = earlySets.reduce((sum, s) => sum + s.count, 0);
        return earlyTotal >= 100;
      });
    },
  },
];

export const getLevel = (xp: number) => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const getXPForNextLevel = (level: number) => {
  return Math.pow(level, 2) * 100;
};
