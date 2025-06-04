import { getSessionUser, type AuthPayload } from "@/lib/auth/auth";
import { prisma } from "@/db/prisma";
import { redirect } from "next/navigation";
import StudentProfileForm from "@/components/forms/student-profile-form";

export default async function StudentProfilePage() {
  const user = await getSessionUser<AuthPayload>();
  if (!user || user.role !== "STUDENT") {
    redirect("/dashboard");
  }
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Student Profile</h1>
        <p className="text-muted-foreground">View and update your student profile information.</p>
      </div>
      <StudentProfileForm profile={profile || {}} />
    </div>
  );
} 