import { SubmissionForm } from "@/components/forms/submission-form";
import { prisma } from "@/db/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSignedDownloadUrl } from "@/lib/s3";
import { Button } from "@/components/ui/button";
import StudentMultiStepSubmissionForm from "@/components/forms/StudentMultiStepSubmissionForm";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

type SubmissionType = "PSA" | "GRADUATION_PHOTO" | "AWARD";
// type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED"; // Using the type from StatusBadge component

// No explicit type needed for Submission here as we fetch StudentProfile

export default async function StudentDashboard({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  // Fetch student profile
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  // Prepare download URLs if profile exists
  let psaUrl = null;
  let gradPhotoUrl = null;
  let awardsUrl = null;
  if (profile) {
    // Add null checks before calling getSignedDownloadUrl
    if (profile.psaS3Key) {
      psaUrl = await getSignedDownloadUrl(profile.psaS3Key);
    }
    if (profile.gradPhotoS3Key) {
      gradPhotoUrl = await getSignedDownloadUrl(profile.gradPhotoS3Key);
    }
    if (profile.awardsS3Key) {
      awardsUrl = await getSignedDownloadUrl(profile.awardsS3Key);
    }
  }

  // Use query param to determine if form should be shown
  const params = await searchParams;
  const updateParam = params?.update;
  const showForm = !profile || updateParam === "1";

  // Determine the status to pass to StatusBadge, defaulting if profile is null or status is undefined
  const statusToDisplay = profile?.overallStatus || 'NOT_SUBMITTED';

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 w-full flex flex-col items-center justify-center py-12 px-2 md:px-0">
        <div className="w-full max-w-3xl flex flex-col items-center justify-center gap-12">
          <div className="flex flex-col gap-8 w-full">
            <h1 className="text-4xl text-center font-bold tracking-tighter sm:text-5xl md:text-6xl mb-2">
              Welcome, {user?.name?.trim() ? user.name : "Student"}!
            </h1>
            <p className="text-muted-foreground text-xl text-center mb-4">
              This is your graduation document dashboard.
            </p>
          </div>
          {/* Profile summary card if profile exists and not updating */}
          {profile && !showForm && (
            <Card className="w-full max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Profile Summary</CardTitle>
                    <CardDescription>Last updated: {new Date(profile.updatedAt).toLocaleString()}</CardDescription>
                  </div>
                  {/* Use the determined status */}
                  <StatusBadge status={statusToDisplay as any} className="text-sm" />
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
                    {/* Add conditional rendering and null checks for URLs */}
                    {psaUrl ? (
                      <li>
                        <a href={psaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Download PSA Certificate</a>
                      </li>
                    ) : (
                      <li>
                        <span className="text-muted-foreground">PSA Certificate: Not Submitted</span>
                      </li>
                    )}
                    {gradPhotoUrl ? (
                      <li>
                        <a href={gradPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Download Graduation Photo</a>
                      </li>
                     ) : (
                      <li>
                        <span className="text-muted-foreground">Graduation Photo: Not Submitted</span>
                      </li>
                    )}
                    {awardsUrl && (
                      <li>
                        <a href={awardsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Download Academic Awards</a>
                      </li>
                    )}
                  </ul>
                </div>
                {/* Check overallStatus for rejection feedback */}
                {profile.overallStatus === "REJECTED" && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">Your submission has been rejected.</p>
                    {profile.feedback && (
                      <p className="text-red-700 text-sm mt-1 font-semibold">Feedback:</p>
                    )}
                    {profile.feedback && (
                      <p className="text-red-700 text-sm mt-1">{profile.feedback}</p>
                    )}
                    {!profile.feedback && (
                      <p className="text-red-700 text-sm mt-1">Please review your documents and submit again.</p>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <form method="GET" className="w-full">
                  {/* Use overallStatus for button text */}
                  <Button type="submit" name="update" value="1" className="w-full mt-2">
                    {profile.overallStatus === "REJECTED" ? "Resubmit Documents" : "Update Documents"}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          )}
          {/* Show the multi-step form if no profile or updating */}
          {showForm && (
            <div className="w-full max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-0 md:p-8 shadow-none">
                <StudentMultiStepSubmissionForm />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 