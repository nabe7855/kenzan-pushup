"use client";

import { useAppContext } from "@/context/AppContext";
import AuthView from "./AuthView";

export default function AuthPage() {
  const { login } = useAppContext();

  return <AuthView onLogin={login} />;
}
