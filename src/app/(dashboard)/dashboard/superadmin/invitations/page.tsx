"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Send, Download, Search, Info, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

const roles = ["Graduate"];
const departments = ["All", "CCS", "CBA", "CAHS", "CEAS", "CHTM"];
const awards = ["All", "Cum Laude", "Magna Cum Laude", "Summa Cum Laude"];

const templateLegend = [
  { var: "[Name]", desc: "Recipient's full name" },
  { var: "[Award]", desc: "Award title (if any)" },
  { var: "[Department]", desc: "Department name" },
];

function replaceVars(template: string, recipient: any) {
  return template
    .replace(/\[Name\]/g, recipient.name)
    .replace(/\[Award\]/g, recipient.award || "")
    .replace(/\[Department\]/g, recipient.department);
}

function TiptapEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });
  return (
    <div className="border rounded-md bg-white">
      <EditorContent editor={editor} className="min-h-[120px] p-2" />
    </div>
  );
}

export default function InvitationsPage() {
  const [roleFilter, setRoleFilter] = useState("Graduate");
  const [deptFilter, setDeptFilter] = useState("All");
  const [awardFilter, setAwardFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [invitation, setInvitation] = useState("<p>Dear [Name],</p><p>You are cordially invited to the graduation ceremony.</p><p>Best regards,<br/>School Administration</p>");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailsRecipient, setDetailsRecipient] = useState<any | null>(null);
  const [previewAllOpen, setPreviewAllOpen] = useState(false);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    fetchRecipients();
    // eslint-disable-next-line
  }, [roleFilter, deptFilter, awardFilter, search, page, pageSize]);

  const fetchRecipients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        role: roleFilter,
        department: deptFilter,
        award: awardFilter,
        search,
        page: String(page),
        limit: String(pageSize),
      });
      const res = await fetch(`/api/superadmin/invitations/recipients?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setRecipients(data.data.recipients);
        setTotalPages(data.data.pagination.pages);
        setTotalRecipients(data.data.pagination.total);
      } else {
        toast.error(data.error || "Failed to fetch recipients");
      }
    } catch {
      toast.error("Failed to fetch recipients");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  };
  const handleSelectAll = () => {
    if (selected.length === recipients.length) setSelected([]);
    else setSelected(recipients.map(r => r.id));
  };
  const handleSelectAllDept = () => {
    if (deptFilter === "All") return;
    const deptIds = recipients.filter(r => r.department === deptFilter).map(r => r.id);
    setSelected(sel => Array.from(new Set([...sel, ...deptIds])));
  };

  const handleSend = async () => {
    setConfirmOpen(false);
    if (selected.length === 0) return;
    try {
      const res = await fetch("/api/superadmin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: selected,
          template: invitation,
          subject: "Graduation Ceremony Invitation",
          eventDate: "2024-06-30",
          eventLocation: "Main Auditorium",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Invitations sent to ${selected.length} recipient(s).`);
        setSelected([]);
        fetchRecipients();
      } else {
        toast.error(data.error || "Failed to send invitations");
      }
    } catch {
      toast.error("Failed to send invitations");
    }
  };

  // Pagination controls
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Generate Invitations</h1>
          <p className="text-muted-foreground">Send invitations to graduates, faculty, admins, and awardees</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select value={roleFilter} onValueChange={setRoleFilter} disabled>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-2 w-full md:w-[180px] items-center">
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="ml-1"
            title="Select all in department"
            onClick={handleSelectAllDept}
            disabled={deptFilter === "All"}
          >
            <Users className="w-4 h-4" />
          </Button>
        </div>
        <Select value={awardFilter} onValueChange={setAwardFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by award" />
          </SelectTrigger>
          <SelectContent>
            {awards.map(award => <SelectItem key={award} value={award}>{award}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Recipients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recipients</CardTitle>
          <div className="text-xs text-muted-foreground mt-1">{selected.length} selected</div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input type="checkbox" checked={selected.length === recipients.length && recipients.length > 0} onChange={handleSelectAll} />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Award</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <input type="checkbox" checked={selected.includes(r.id)} onChange={() => handleSelect(r.id)} />
                    </TableCell>
                    <TableCell>
                      <button className="text-primary underline" onClick={e => { e.preventDefault(); setDetailsRecipient(r); }}>{r.name}</button>
                    </TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.role}</TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>{r.award}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setDetailsRecipient(r)}>
                        <Info className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page === 1}>Prev</Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(i + 1)}
                  className={page === i + 1 ? "font-bold" : ""}
                >
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page === totalPages}>Next</Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">Rows per page:</span>
              <select value={pageSize} onChange={handlePageSizeChange} className="border rounded px-2 py-1 text-xs">
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalRecipients)} of {totalRecipients}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipient Details Modal */}
      <Dialog open={!!detailsRecipient} onOpenChange={() => setDetailsRecipient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recipient Details</DialogTitle>
          </DialogHeader>
          {detailsRecipient && (
            <div className="space-y-2">
              <div><b>Name:</b> {detailsRecipient.name}</div>
              <div><b>Email:</b> {detailsRecipient.email}</div>
              <div><b>Role:</b> {detailsRecipient.role}</div>
              <div><b>Department:</b> {detailsRecipient.department}</div>
              <div><b>Award:</b> {detailsRecipient.award || "-"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invitation Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Invitation Content</CardTitle>
          <div className="flex gap-4 mt-2">
            {templateLegend.map(item => (
              <span key={item.var} className="text-xs bg-muted px-2 py-1 rounded">
                <b>{item.var}</b>: {item.desc}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <TiptapEditor value={invitation} onChange={setInvitation} />
          <div className="flex gap-2 mt-4">
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" type="button">
                  <Eye className="w-4 h-4 mr-2" /> Preview
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invitation Preview</DialogTitle>
                </DialogHeader>
                <div className="border rounded-md p-4 bg-muted">
                  {selected.length === 1
                    ? <div dangerouslySetInnerHTML={{ __html: replaceVars(invitation, recipients.find(r => r.id === selected[0])!) }} />
                    : <div className="text-muted-foreground">Select a single recipient to preview personalized invitation.</div>
                  }
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={previewAllOpen} onOpenChange={setPreviewAllOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" type="button" disabled={selected.length === 0}>
                  <Eye className="w-4 h-4 mr-2" /> Preview All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Preview All Invitations ({selected.length})</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {selected.map(id => {
                    const rec = recipients.find(r => r.id === id);
                    if (!rec) return null;
                    return (
                      <div key={id} className="border rounded-md p-4 bg-muted">
                        <div className="font-bold mb-2">{rec.name} ({rec.email}) - {rec.department}{rec.award ? `, ${rec.award}` : ""}</div>
                        <div dangerouslySetInnerHTML={{ __html: replaceVars(invitation, rec) }} />
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button variant="default" type="button" disabled={selected.length === 0}>
                  <Send className="w-4 h-4 mr-2" /> Send Invitations
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Send</DialogTitle>
                </DialogHeader>
                <div>Are you sure you want to send invitations to <b>{selected.length}</b> recipient(s)?</div>
                <div className="flex gap-2 mt-4">
                  <Button variant="default" onClick={handleSend}>Yes, Send</Button>
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="secondary" type="button" disabled={selected.length === 0} onClick={() => toast.info("Export as PDF coming soon!") }>
              <Download className="w-4 h-4 mr-2" /> Export as PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 