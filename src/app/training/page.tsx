"use client";

import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import TrainingView from "./TrainingView";

export default function TrainingPage() {
  const { user, addSet } = useAppContext();
  const router = useRouter();

  if (!user) return null;

  return (
    <TrainingView
      user={user}
      onFinish={async (count, details) => {
        await addSet(count, details);
        router.push("/");
      }}
      onCancel={() => router.push("/")}
    />
  );
}
