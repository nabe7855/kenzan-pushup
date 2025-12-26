"use client";

import AuthView from "@/app/auth/AuthView";
import Confetti from "@/components/Confetti";
import Layout from "@/components/Layout";
import { useAppContext } from "@/context/AppContext";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hooks MUST be at the top level
  const { user, isLoggedIn, isLoading, error, showConfetti, login } =
    useAppContext();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn && pathname !== "/auth") {
      router.push("/auth");
    }
    if (!isLoading && isLoggedIn && pathname === "/auth") {
      router.push("/");
    }
  }, [isLoading, isLoggedIn, pathname, router]);

  // Handle Loading state
  if (isLoading || (isLoggedIn && !user && !error)) {
    return (
      <div className="layout-container flex items-center justify-center bg-black min-h-screen">
        <div className="text-amber-500 font-black italic animate-pulse">
          読み込み中 - 研鑽(kenzan)-腕立て...
        </div>
      </div>
    );
  }

  // Handle Error state
  if (error) {
    return (
      <div className="layout-container flex items-center justify-center bg-black min-h-screen p-6 text-center">
        <div className="space-y-4">
          <div className="text-red-500 font-black italic text-xl uppercase tracking-widest">
            ERROR DETECTED
          </div>
          <div className="text-zinc-400 text-sm font-mono max-w-xs mx-auto">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-zinc-800 text-white rounded-full font-bold hover:bg-zinc-700 transition-colors"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  // Handle Auth view
  if (pathname === "/auth") {
    return <AuthView onLogin={login} />;
  }

  // Default App view
  return (
    <>
      <Confetti active={showConfetti} />
      <Layout>{children}</Layout>
    </>
  );
}
