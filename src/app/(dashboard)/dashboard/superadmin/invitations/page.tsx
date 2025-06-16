import { Suspense } from "react";
import InvitationsClient from "./InvitationsClient";
import { getInvitationRecipients } from "@/actions/superadmin-invitations.actions";
import { getSuperadminStudents } from "@/actions/superadmin-students.actions";

export const dynamic = "force-dynamic";

export default async function InvitationsPage() {
  const initialRecipientsData = await getInvitationRecipients({});
  const initialStudentsData = await getSuperadminStudents({});

  return (
    <Suspense fallback={<div className="p-8">Loading invitations UI…</div>}>
      <InvitationsClient 
        initialRecipients={initialRecipientsData.recipients}
        initialStudents={initialStudentsData.students}
        initialPagination={initialRecipientsData.pagination}
      />
    </Suspense>
  );
}
