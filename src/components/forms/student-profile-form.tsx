"use client";
import { useState } from "react";
import { updateOwnStudentProfile } from "@/actions/student-profile.actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function StudentProfileForm({ profile }: { profile: any }) {
  const [form, setForm] = useState({
    studentId: profile?.studentId || "",
    program: profile?.program || "",
    department: profile?.department || "",
    dob: profile?.dob || "",
    pob: profile?.pob || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateOwnStudentProfile(form);
    if (result.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error(result.message || "Failed to update profile.");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium">Student ID</label>
        <Input name="studentId" value={form.studentId} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Program</label>
        <Input name="program" value={form.program} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Department</label>
        <Input name="department" value={form.department} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Date of Birth</label>
        <Input name="dob" value={form.dob} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Place of Birth</label>
        <Input name="pob" value={form.pob} onChange={handleChange} required />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
        {saving ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
} 