export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

import { Suspense } from "react";
import { prisma } from "@/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getSignedDownloadUrl } from "@/lib/utils/s3";
import { Button } from "@/components/ui/button";
import StudentMultiStepSubmissionForm from "@/components/forms/student-multi-step-submission-form";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import StudentDashboardSkeleton from "@/components/skeletons/student-dashboard-skeleton";
import { unstable_cache } from 'next/cache';

type User = { id: string; role: string; name?: string };

// Cache the profile fetch
const getProfileData = unstable_cache(
	async (userId: string) => {
		const profile = await prisma.studentProfile.findUnique({
			where: { userId },
		});
		return profile;
	},
	['student-profile'],
	{ revalidate: 300 } // 5 minutes
);

async function getData(userId: string) {
	const profile = await getProfileData(userId);

	// Only fetch URLs if profile exists and has keys
	let psaUrl = null;
	let gradPhotoUrl = null;
	if (profile?.psaS3Key || profile?.gradPhotoS3Key) {
		const [psa, grad] = await Promise.all([
			profile.psaS3Key ? getSignedDownloadUrl(profile.psaS3Key) : null,
			profile.gradPhotoS3Key ? getSignedDownloadUrl(profile.gradPhotoS3Key) : null
		]);
		psaUrl = psa;
		gradPhotoUrl = grad;
	}

	return { profile, psaUrl, gradPhotoUrl };
}

// Split the header into a separate component for better streaming
function DashboardHeader({ userName }: { userName: string }) {
	return (
		<div className="w-full max-w-3xl mx-auto">
			<div className="flex flex-col gap-8 w-full">
				<h1 className="text-4xl text-center font-bold tracking-tighter sm:text-5xl md:text-6xl mb-2 mt-12">
					Welcome, {userName?.trim() ? userName : "Student"}!
				</h1>
				<p className="text-muted-foreground text-xl text-center mb-4">
					This is your graduation document dashboard.
				</p>
			</div>
		</div>
	);
}

function DashboardContent({
	profile,
	psaUrl,
	gradPhotoUrl,
	searchParams,
}: {
	profile: any;
	psaUrl: string | null;
	gradPhotoUrl: string | null;
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const updateParam = searchParams?.update;
	const showForm = !profile || updateParam === "1";
	const statusToDisplay = profile?.overallStatus || "NOT_SUBMITTED";

	return (
		<>
			{/* Inbox Card */}
			<div className="w-full max-w-3xl mx-auto mt-8">
				<div className="mb-4 flex justify-end">
					<a href="/dashboard/student/profile">
						<Button variant="outline">Edit Profile</Button>
					</a>
				</div>
				<div className="mb-8">
					<div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 shadow-sm">
						<h2 className="text-lg font-bold text-blue-300 mb-2 flex items-center gap-2">
							📥 Inbox
						</h2>
						{profile?.feedback ? (
							<div>
								<div className="text-blue-100 text-base mb-1 font-medium">
									Message from Admin/Faculty/Superadmin:
								</div>
								<div className="text-blue-200 text-sm whitespace-pre-line">
									{profile.feedback}
								</div>
								{profile.updatedAt && (
									<div className="text-xs text-blue-400 mt-2">
										Last updated: {new Date(profile.updatedAt).toLocaleString()}
									</div>
								)}
							</div>
						) : (
							<div className="text-blue-300 text-sm">
								No messages yet. If your submission is rejected, you will see the
								reason and required actions here.
							</div>
						)}
					</div>
				</div>
			</div>
			<div className="flex-1 w-full flex flex-col items-center justify-center py-12 px-2 md:px-0">
				<div className="w-full max-w-3xl flex flex-col items-center justify-center gap-12">
					{/* Profile summary card if profile exists and not updating */}
					{profile && !showForm && (
						<Card className="w-full max-w-2xl mx-auto">
							<CardHeader>
								<div className="flex justify-between items-start">
									<div>
										<CardTitle>Profile Summary</CardTitle>
										<CardDescription>
											Last updated: {new Date(profile.updatedAt).toLocaleString()}
										</CardDescription>
									</div>
									<StatusBadge
										status={
											statusToDisplay as
												| "PENDING"
												| "APPROVED"
												| "REJECTED"
												| "NOT_SUBMITTED"
										}
										className="text-sm"
									/>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<div className="font-semibold">Student ID:</div>
										<div>{profile.studentId}</div>
									</div>
									<div>
										<div className="font-semibold">Program:</div>
										<div>{profile.program}</div>
									</div>
									<div>
										<div className="font-semibold">Department:</div>
										<div>{profile.department}</div>
									</div>
									<div>
										<div className="font-semibold">Date of Birth:</div>
										<div>{profile.dob}</div>
									</div>
									<div>
										<div className="font-semibold">Place of Birth:</div>
										<div>{profile.pob}</div>
									</div>
								</div>
								<div className="mt-6">
									<div className="font-semibold mb-2">Your Documents:</div>
									<ul className="space-y-2">
										{psaUrl ? (
											<li>
												<a
													href={psaUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-400 underline font-medium"
												>
													Download PSA Certificate
												</a>
											</li>
										) : (
											<li>
												<span className="text-muted-foreground">
													PSA Certificate: Not Submitted
												</span>
											</li>
										)}
										{gradPhotoUrl ? (
											<li>
												<a
													href={gradPhotoUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-400 underline font-medium"
												>
													Download Graduation Photo
												</a>
											</li>
										) : (
											<li>
												<span className="text-muted-foreground">
													Graduation Photo: Not Submitted
												</span>
											</li>
										)}
									</ul>
								</div>
								{profile.overallStatus === "REJECTED" && (
									<div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
										<p className="text-red-200 font-medium">
											Your submission has been rejected.
										</p>
										{profile.feedback && (
											<p className="text-red-300 text-sm mt-1 font-semibold">
												Feedback:
											</p>
										)}
										{profile.feedback && (
											<p className="text-red-300 text-sm mt-1">
												{profile.feedback}
											</p>
										)}
										{!profile.feedback && (
											<p className="text-red-300 text-sm mt-1">
												Please review your documents and submit again.
											</p>
										)}
									</div>
								)}
							</CardContent>
							<CardFooter>
								<form method="GET" className="w-full">
									<Button
										type="submit"
										name="update"
										value="1"
										className="w-full mt-2"
									>
										{profile.overallStatus === "REJECTED"
											? "Resubmit Documents"
											: "Update Documents"}
									</Button>
								</form>
							</CardFooter>
						</Card>
					)}
					{showForm && (
						<div className="w-full max-w-2xl mx-auto">
							<div className="bg-transparent rounded-xl p-0 md:p-8 shadow-none">
								<StudentMultiStepSubmissionForm />
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default async function StudentDashboard({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const user = (await getSessionUser()) as User | null;

	if (!user) {
		redirect("/login");
	}

	if (user.role !== "STUDENT") {
		redirect("/dashboard");
	}

	// Render heading and intro immediately
	return (
		<div className="min-h-screen w-full flex flex-col">
			<div className="w-full max-w-3xl mx-auto">
				<div className="flex flex-col gap-8 w-full">
					<h1 className="text-4xl text-center font-bold tracking-tighter sm:text-5xl md:text-6xl mb-2 mt-12">
						Welcome, {user.name?.trim() ? user.name : "Student"}!
					</h1>
					<p className="text-muted-foreground text-xl text-center mb-4">
						This is your graduation document dashboard.
					</p>
				</div>
			</div>
			{/* Only async content below */}
			<Suspense fallback={<StudentDashboardSkeleton />}>
				{/* @ts-expect-error Async Server Component */}
				<AsyncDashboardContent userId={user.id} searchParams={searchParams} />
			</Suspense>
		</div>
	);
}

// Separate async component for content
async function AsyncDashboardContent({ 
	userId, 
	searchParams 
}: { 
	userId: string;
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const { profile, psaUrl, gradPhotoUrl } = await getData(userId);
	
	return (
		<DashboardContent
			profile={profile}
			psaUrl={psaUrl}
			gradPhotoUrl={gradPhotoUrl}
			searchParams={searchParams}
		/>
	);
} 