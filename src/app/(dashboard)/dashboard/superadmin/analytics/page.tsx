import { Suspense } from "react";
import SummaryPanel from "./SummaryPanel";
import { getSuperadminAnalytics } from "@/actions/superadmin-analytics.actions";
import ChartsDynamic from "./ChartsDynamic";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const initialRange: "7days" | "30days" | "90days" = "30days";
  const initialData = await getSuperadminAnalytics(initialRange);

  return (
    <div className="p-8 space-y-8">
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>

      {/* 1️⃣ Summary counts rendered on the server */}
      <Suspense fallback={<div className="p-6">Loading summary…</div>}>
        {/* @ts-expect-error Async Server Component */}
        <SummaryPanel />
      </Suspense>

      {/* 2️⃣ Heavy charts & interactivity – client side only */}
      <ChartsDynamic initialRange={initialRange} initialData={initialData} />
    </div>
  );
} 