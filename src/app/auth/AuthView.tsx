import { ChevronRight, Lock, Mail, ShieldCheck, User, Zap } from "lucide-react";
import React, { useState } from "react";

interface AuthProps {
  onLogin: (
    email: string,
    password: string,
    isSignUp: boolean,
    name?: string
  ) => Promise<void>;
}

const AuthView: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onLogin(email, password, !isLogin, name);
      if (!isLogin) {
        alert("確認メールを送信しました。メールをご確認ください。");
      }
    } catch (err: any) {
      alert(err.message || "エラーが発生しました。");
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-bg-gradient" />

      <div className="auth-content animate-slide-in-bottom">
        <div className="text-center space-y-2">
          <div className="auth-logo-container senkai-gradient">
            <Zap size={40} className="text-white fill-white" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter senkai-gradient text-transparent-clip">
            研鑽(kenzan)-腕立て
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">
            {isLogin ? "極限の鍛錬へ、再び。" : "伝説の始まり。"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-input-group">
              <label className="auth-label">
                <User size={12} /> ニックネーム
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="修行者の名"
                className="auth-input"
              />
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-label">
              <Mail size={12} /> メールアドレス
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="senkai@training.com"
              className="auth-input"
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">
              <Lock size={12} /> パスワード
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="auth-input"
            />
          </div>

          <button type="submit" className="auth-submit-button senkai-gradient">
            {isLogin ? "ログイン" : "修行を開始"}
            <ChevronRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-500 hover:text-amber-500 text-xs font-black uppercase tracking-widest transition-colors"
          >
            {isLogin
              ? "新規アカウントを作成する"
              : "既にアカウントをお持ちの方"}
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-900">
          <div className="flex items-center gap-1.5 text-zinc-700">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase">
              Secure Training
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-[9px] text-zinc-800 font-black uppercase tracking-[0.5em] text-center max-w-[200px]">
        No matter how many times you fail, the floor is always there to catch
        you.
      </div>
    </div>
  );
};

export default AuthView;
