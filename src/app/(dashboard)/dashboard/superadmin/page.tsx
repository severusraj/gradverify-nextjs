import { Suspense } from "react";

// Lazy-load each section as independent server components so that the browser can start
// painting as soon as the first chunk (statistics) is ready while the heavier queries
// for submissions and awards continue in parallel. This greatly improves LCP/TTFB.

import StatsPanel from "./StatsPanel";
import RecentSubmissionsPanel from "./RecentSubmissionsPanel";
import RecentAwardsPanel from "./RecentAwardsPanel";

export const dynamic = "force-dynamic"; // ensure real-time data for super admins

export default function SuperadminDashboardPage() {
	return (
		<div className="p-8 space-y-8">
			<Suspense fallback={<div className="p-6">Loading statistics…</div>}>
				{/* 1️⃣ Stats (lightweight) */}
				{/* @ts-expect-error Async Server Component */}
				<StatsPanel />
			</Suspense>

			<Suspense fallback={<div className="p-6">Loading recent submissions…</div>}>
				{/* 2️⃣ Latest submissions */}
				{/* @ts-expect-error Async Server Component */}
				<RecentSubmissionsPanel />
			</Suspense>

			<Suspense fallback={<div className="p-6">Loading recent awards…</div>}>
				{/* 3️⃣ Latest awards */}
				{/* @ts-expect-error Async Server Component */}
				<RecentAwardsPanel />
			</Suspense>
		</div>
	);
} 