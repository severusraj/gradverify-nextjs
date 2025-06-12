import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboardSkeleton() {
	return (
		<div className="w-full max-w-3xl mx-auto mt-8">
			{/* Inbox Skeleton */}
			<div className="mb-8">
				<div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 shadow-sm">
					<h2 className="text-lg font-bold text-blue-300 mb-2 flex items-center gap-2">
						📥 Inbox
					</h2>
					<Skeleton className="h-4 w-3/4" />
				</div>
			</div>

			{/* Main Content Skeleton */}
			<div className="flex-1 w-full flex flex-col items-center justify-center py-12 px-2 md:px-0">
				<div className="w-full max-w-3xl flex flex-col items-center justify-center gap-12">
					<Card className="w-full max-w-2xl mx-auto">
						<CardHeader>
							<div className="flex justify-between items-start">
								<div>
									<Skeleton className="h-6 w-32 mb-2" />
									<Skeleton className="h-4 w-48" />
								</div>
								<Skeleton className="h-8 w-24" />
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-full" />
								</div>
								<div className="space-y-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-full" />
								</div>
								<div className="space-y-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-full" />
								</div>
								<div className="space-y-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-full" />
								</div>
							</div>
							<div className="mt-6 space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-4 w-48" />
								<Skeleton className="h-4 w-48" />
							</div>
						</CardContent>
						<CardFooter>
							<Skeleton className="h-10 w-full" />
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
} 