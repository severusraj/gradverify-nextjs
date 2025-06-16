"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  Mail, 
  Users, 
  Eye, 
  Send, 
  Download, 
  Search, 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock,
  Image as ImageIcon,
  FileText,
  Filter,
  UserCheck,
  Award,
  Building2,
  Calendar,
  MapPin
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { getInvitationRecipients, createInvitation } from "@/actions/superadmin-invitations.actions";
import { getSuperadminStudents } from "@/actions/superadmin-students.actions";
import { convertImageToBase64 } from "@/actions/convert-image.actions";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import MarkdownIt from "markdown-it";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Constants
const roles = ["Graduate"];
const departments = ["All", "CCS", "CBA", "CAHS", "CEAS", "CHTM"];
const awards = ["All", "Cum Laude", "Magna Cum Laude", "Summa Cum Laude"];

const templateLegend = [
  { var: "{{name}}", desc: "Recipient's full name" },
  { var: "{{email}}", desc: "Recipient's email" },
  { var: "{{program}}", desc: "Program/Department" },
  { var: "{{award}}", desc: "Award title (if any)" },
  { var: "{{gradPhoto}}", desc: "Graduation photo" },
];

// Interfaces
interface Student {
  id: string;
  name: string;
  email: string;
  program: string;
  gradPhoto: string;
  award?: string;
  role: string;
  department: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  award?: string;
  gradPhotoUrl?: string;
}

// Helper components
const InvitationCard = ({ recipient }: { recipient: Student | Recipient }) => (
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-8 relative overflow-hidden">
    {/* Decorative elements */}
    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>
    <div className="absolute top-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
    
    {/* Header */}
    <div className="text-center mb-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
        <span className="text-2xl font-bold text-white">🎓</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        GRADUATION INVITATION
      </h1>
      <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
    </div>

    {/* Main Content */}
    <div className="space-y-6">
      {/* Greeting */}
      <div className="text-center">
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Dear</p>
        <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-300 mb-4">
          {recipient.name}
        </h2>
        <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">
          🎉 Congratulations on your graduation! 🎉
        </p>
      </div>

      {/* Graduation Photo */}
      {(('gradPhoto' in recipient && (recipient as Student).gradPhoto) || 
        ('gradPhotoUrl' in recipient && (recipient as Recipient).gradPhotoUrl)) && (
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-400 to-purple-400 shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <img
                src={('gradPhoto' in recipient ? (recipient as Student).gradPhoto : (recipient as Recipient).gradPhotoUrl!)}
                alt="Graduation Photo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-avatar')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-avatar w-full h-full flex items-center justify-center text-4xl text-gray-400';
                    fallback.innerHTML = '👤';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-sm">🏆</span>
            </div>
          </div>
        </div>
      )}

      {/* Award Recognition */}
      {recipient.award && (
        <div className="text-center bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800 dark:text-yellow-300">Special Recognition</span>
          </div>
          <p className="text-lg font-bold text-yellow-700 dark:text-yellow-200">
            {recipient.award}
          </p>
        </div>
      )}

      {/* Event Details */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-xl font-bold text-center text-blue-800 dark:text-blue-300 mb-4">
          🎓 GRADUATION CEREMONY 🎓
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-700 dark:text-blue-300">July 9, 2025</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-700 dark:text-blue-300">10:00 AM</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-700 dark:text-blue-300 text-center">
              Subic Bay Exhibition and Convention Center
            </span>
          </div>
        </div>
      </div>

      {/* Program Info */}
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-1">Program:</p>
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          {'program' in recipient ? recipient.program : recipient.department}
        </p>
      </div>

      {/* Closing */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          We look forward to celebrating this momentous achievement with you!
        </p>
        <p className="font-bold text-blue-800 dark:text-blue-300">
          Gordon College Administration
        </p>
      </div>
    </div>

    {/* Decorative bottom border */}
    <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>
  </div>
);

// Styled wrapper that mimics the dark invitation card shell used in the exported PDF
const StyledCard = ({ children }: { children: React.ReactNode }) => (
  <div
    className="relative rounded-lg overflow-hidden shadow-xl"
    style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}
  >
    {/* top gradient bars */}
    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
    <div className="absolute top-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400" />

    {/* content */}
    <div className="relative z-10 bg-[#0f172a] p-6 sm:p-10 text-white">
      {children}
    </div>

    {/* bottom gradient bar */}
    <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
  </div>
);

// Helper functions
function replaceVars(template: string, recipient: Student | Recipient) {
  let result = template
    .replace(/{{name}}/g, recipient.name)
    .replace(/{{email}}/g, recipient.email)
    .replace(/{{program}}/g, 'program' in recipient ? recipient.program : recipient.department);

  // Handle award - only show if recipient has an award
  if (recipient.award) {
    result = result.replace(/{{award}}/g, recipient.award);
  } else {
    // Remove the entire award section if no award
    result = result.replace(/\*\*Special Recognition:\*\* {{award}}\n\n/g, '');
    result = result.replace(/{{award}}/g, '');
  }

  // Handle graduation photo - only show if recipient has a photo
  let photoUrl: string | null = null;
  if ('gradPhoto' in recipient && (recipient as Student).gradPhoto) {
    photoUrl = (recipient as Student).gradPhoto;
  } else if ('gradPhotoUrl' in recipient && (recipient as Recipient).gradPhotoUrl) {
    photoUrl = (recipient as Recipient).gradPhotoUrl!;
  }
  if (photoUrl) {
    const safeUrl = photoUrl.includes(' ') ? encodeURI(photoUrl) : photoUrl;
    result = result.replace(/{{gradPhoto}}/g, safeUrl);
  } else {
    // Remove entire photo section
    result = result.replace(/Your graduation photo:\n!\[Grad Photo\]\({{gradPhoto}}\)\n\n/g, "");
    result = result.replace(/!\[Grad Photo\]\({{gradPhoto}}\)/g, "");
    result = result.replace(/{{gradPhoto}}/g, "");
  }

  return result;
}

// Shared class list for consistent markdown styling across live preview, dialogs, and PDF export
const MARKDOWN_PREVIEW_CLASSES = "prose prose-lg max-w-none dark:prose-invert prose-headings:text-blue-800 dark:prose-headings:text-blue-300 prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-6 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold prose-links:text-blue-600 dark:prose-links:text-blue-400 prose-links:underline prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-li:my-1 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-img:rounded-full prose-img:mx-auto prose-img:border-4 prose-img:border-blue-200 prose-img:shadow-lg prose-img:mb-6 prose-img:mt-6 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:p-4 prose-blockquote:rounded-r prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm";

export default function InvitationsPage() {
  // State for general invitations
  const [roleFilter, setRoleFilter] = useState("Graduate");
  const [deptFilter, setDeptFilter] = useState("All");
  const [awardFilter, setAwardFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // State for mail merge
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [mailMergeLoading, setMailMergeLoading] = useState(false);

  // Common state
  const [activeTab, setActiveTab] = useState("general");
  const [editorValue, setEditorValue] = useState(`# Graduation Invitation

Dear {{name}},

🎓 **Congratulations on your graduation!**

We are delighted to invite you to the **Gordon College Graduation Ceremony**.

**Event Details:**
- 📅 **Date:** July 9, 2025
- 📍 **Location:** Subic Bay Exhibition and Convention Center
- ⏰ **Time:** 10:00 AM

Your graduation photo:
![Grad Photo]({{gradPhoto}})

**Special Recognition:** {{award}}

We look forward to celebrating this momentous achievement with you!

Best regards,  
**Gordon College Administration**`);

  const [previewRecipient, setPreviewRecipient] = useState<Student | Recipient | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<Record<string, string>>({});
  const [successCount, setSuccessCount] = useState(0);

  // Dialog states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailsRecipient, setDetailsRecipient] = useState<Recipient | null>(null);
  const [previewAllOpen, setPreviewAllOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"rendered" | "raw">("rendered");

  // Effects
  useEffect(() => {
    if (activeTab === "general") {
      fetchRecipients();
    } else {
      loadStudents();
    }
  }, [activeTab, roleFilter, deptFilter, awardFilter, search, page, pageSize]);

  // General invitations functions
  const fetchRecipients = async () => {
    setLoading(true);
    try {
      const result = await getInvitationRecipients({
        role: roleFilter,
        department: deptFilter,
        award: awardFilter,
        search,
        page,
        limit: pageSize,
      });
      if (result.success) {
        setRecipients(result.recipients ?? []);
        if (result.pagination) {
          setTotalPages(result.pagination.pages);
          setTotalRecipients(result.pagination.total);
        }
      } else {
        toast.error(result.error || "Failed to fetch recipients");
      }
    } catch {
      toast.error("Failed to fetch recipients");
    } finally {
      setLoading(false);
    }
  };

  // Mail merge functions
  const loadStudents = async () => {
    try {
      setMailMergeLoading(true);
      setError("");
      const res = await getSuperadminStudents({ overallStatus: "APPROVED", limit: 100 });
      if (res.success) {
        const studentData = (res.students || []).map((s: any) => {
          // Use the existing gradPhotoUrl if available, otherwise construct from S3 key
          let photoUrl = "";
          if (s.gradPhotoUrl && s.gradPhotoUrl.startsWith('http')) {
            photoUrl = s.gradPhotoUrl;
          } else if (s.gradPhotoS3Key && s.gradPhotoS3Key.trim()) {
            // Only construct S3 URL if we have a valid S3 key
            photoUrl = `https://gradverify-bucket.s3.amazonaws.com/${s.gradPhotoS3Key}`;
          }
          
          return {
            id: s.userId,
            name: s.user?.name || "Unknown",
            email: s.user?.email || "",
            program: s.program || "Unknown Program",
            gradPhoto: photoUrl,
            role: "Graduate",
            department: s.program || "Unknown Program",
            award: s.award || "",
          };
        });
        setStudents(studentData);
        console.log('Loaded students:', studentData);
        if (studentData.length > 0 && !previewRecipient) {
          setPreviewRecipient(studentData[0]);
          console.log('Set preview recipient:', studentData[0]);
        }
      } else {
        setError("Failed to load students. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while loading students.");
    } finally {
      setMailMergeLoading(false);
    }
  };

  // Selection handlers
  const handleSelect = (id: string) => {
    if (activeTab === "general") {
      setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
    } else {
      setSelectedStudents(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
    }
  };

  const handleSelectAll = () => {
    if (activeTab === "general") {
      if (selected.length === recipients.length) setSelected([]);
      else setSelected(recipients.map(r => r.id));
    } else {
      if (selectedStudents.length === students.length) setSelectedStudents([]);
      else setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleSelectAllDept = () => {
    if (deptFilter === "All") return;
    const deptIds = recipients.filter(r => r.department === deptFilter).map(r => r.id);
    setSelected(sel => Array.from(new Set([...sel, ...deptIds])));
  };

    // Send handlers
  const handleSend = async () => {
    setConfirmOpen(false);
    const currentSelected = activeTab === "general" ? selected : selectedStudents;
    if (currentSelected.length === 0) {
      toast.error("No recipients selected");
      return;
    }

    // Validate template content
    if (!editorValue.trim()) {
      toast.error("Please create an invitation template before sending");
      return;
    }
    
    setSending(true);
    setStatus({});
    setSuccessCount(0);
    
    try {
      // Show initial progress
      toast.info(`Starting to send ${currentSelected.length} invitation${currentSelected.length > 1 ? 's' : ''}...`);
      
      const res = await createInvitation({
        recipients: currentSelected,
        template: editorValue,
        subject: "🎓 Graduation Invitation - Gordon College",
        eventDate: "2025-06-09",
        eventLocation: "Subic Bay Exhibition and Convention Center",
      });
      
      const newStatus: Record<string, string> = {};
      if (res.success) {
        // Mark all as sent
        currentSelected.forEach((id) => { 
          newStatus[id] = "sent"; 
        });
        setSuccessCount(currentSelected.length);
        
        // Success notification with details
        toast.success(
          `🎉 Successfully sent ${currentSelected.length} graduation invitation${currentSelected.length > 1 ? 's' : ''}!`,
          {
            description: `Recipients will receive personalized invitations for the July 9, 2025 ceremony.`,
            duration: 5000,
          }
        );
        
        // Clear selections and refresh data
        if (activeTab === "general") {
          setSelected([]);
          fetchRecipients();
        } else {
          setSelectedStudents([]);
          loadStudents();
        }
      } else {
        // Mark all as failed
        currentSelected.forEach((id) => { 
          newStatus[id] = "failed"; 
        });
        
        // Error notification with details
        toast.error(
          "Failed to send invitations",
          {
            description: res.message || "Please check your connection and try again.",
            duration: 5000,
          }
        );
      }
      setStatus(newStatus);
    } catch (err) {
      console.error("Send invitation error:", err);
      
      // Mark all as failed
      const newStatus: Record<string, string> = {};
      currentSelected.forEach((id) => { 
        newStatus[id] = "failed"; 
      });
      setStatus(newStatus);
      
      // Error notification
      toast.error(
        "Network error occurred",
        {
          description: "Please check your internet connection and try again.",
          duration: 5000,
        }
      );
    } finally {
      setSending(false);
    }
  };

  // Pagination handlers
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  // Preview functions
  const getPreviewMarkdown = () => {
    if (!previewRecipient) return "";
    const result = replaceVars(editorValue, previewRecipient);
    console.log('Preview recipient:', previewRecipient);
    console.log('Generated markdown:', result);
    return result;
  };

  // Helper function to convert image to base64 using server action
  const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
    try {
      if (!imageUrl || !imageUrl.startsWith('http')) {
        return '';
      }

      const result = await convertImageToBase64(imageUrl);
      
      if (result.success && result.dataUrl) {
        return result.dataUrl;
      } else {
        console.log('Server-side image conversion failed:', result.error);
        return '';
      }
    } catch (error) {
      console.log('Image conversion failed, using placeholder:', error);
      return '';
    }
  };

  // PDF Export function
  const exportToPDF = async () => {
    if (currentSelected.length === 0) {
      toast.error("Please select recipients to export");
      return;
    }

    try {
      toast.info("Generating PDF... This may take a moment.");
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Markdown parser for converting template into HTML
      const mdParser = new MarkdownIt({ html: true, linkify: true, breaks: true });

      let isFirstPage = true;
      let processedCount = 0;

      for (const id of currentSelected) {
        const recipient = currentData.find(r => r.id === id);
        if (!recipient) continue;

        processedCount++;
        toast.info(`Processing invitation ${processedCount} of ${currentSelected.length}...`);

        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Get image as base64 if available
        let imageBase64 = '';
        const imageUrl = ('gradPhoto' in recipient ? (recipient as Student).gradPhoto : (recipient as Recipient).gradPhotoUrl);
        
        if (imageUrl && imageUrl.startsWith('http')) {
          try {
            toast.info(`Loading photo for ${recipient.name}...`);
            imageBase64 = await getImageAsBase64(imageUrl);
            if (imageBase64) {
              console.log(`Successfully loaded image for ${recipient.name}`);
            }
          } catch (error) {
            console.log('Skipping image for recipient:', recipient.name, error);
          }
        }

        // Create a temporary div for rendering the invitation using markdown (same as live preview)
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '190mm';
        tempDiv.style.padding = '10mm';
        tempDiv.style.backgroundColor = 'white';

        // Embed grad photo directly into markdown before parsing so html2canvas always sees a data-url image
        const markdownWithPhoto = editorValue.replace(/\{\{gradPhoto\}\}/g, imageBase64 || "");

        // Fill other variables (name, email, etc.)
        const filledMarkdown = replaceVars(markdownWithPhoto, recipient);

        // Parse to HTML and wrap in card shell
        const renderedHtml = mdParser.render(filledMarkdown);
        tempDiv.innerHTML = generateInvitationHtmlFromMarkdown(renderedHtml);

        document.body.appendChild(tempDiv);

        // wait briefly to ensure base64 image is rendered in DOM
        await new Promise((res)=>setTimeout(res,200));

        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL('image/png');
        const pageWidth = 210; // A4 width mm portrait
        const pageHeight = 297; // A4 height mm portrait

        let imgWidth = pageWidth;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        // scale down if taller than page
        if (imgHeight > pageHeight) {
          imgHeight = pageHeight;
          imgWidth = (canvas.width * imgHeight) / canvas.height;
        }

        const posX = (pageWidth - imgWidth) / 2;
        const posY = (pageHeight - imgHeight) / 2;

        pdf.addImage(imgData, 'PNG', posX, posY, imgWidth, imgHeight);
      }

      // Save the PDF
      const fileName = `graduation-invitations-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success(`PDF exported successfully! (${currentSelected.length} invitation${currentSelected.length > 1 ? 's' : ''})`);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Failed to export PDF. Please try again.");
    }
  };

  const getStatusBadge = (recipientId: string) => {
    const recipientStatus = status[recipientId];
    if (!recipientStatus) return null;
    
    switch (recipientStatus) {
      case "sent":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const currentSelected = activeTab === "general" ? selected : selectedStudents;
  const currentData = activeTab === "general" ? recipients : students;
  const currentLoading = activeTab === "general" ? loading : mailMergeLoading;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Graduation Invitations</h1>
          <p className="text-muted-foreground">Send personalized invitations to graduates and recipients</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{currentData.length}</p>
              <p className="text-sm text-muted-foreground">Total Recipients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{currentSelected.length}</p>
              <p className="text-sm text-muted-foreground">Selected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Send className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{successCount}</p>
              <p className="text-sm text-muted-foreground">Sent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-lg font-bold">July 9, 2025</p>
              <p className="text-sm text-muted-foreground">Event Date</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Takes remaining height */}
      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            General Invitations
          </TabsTrigger>
          <TabsTrigger value="mailmerge" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Mail Merge (with Photos)
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0">
          <TabsContent value="general" className="h-full flex flex-col space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Select value={roleFilter} onValueChange={setRoleFilter} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2 items-center">
                  <Select value={deptFilter} onValueChange={setDeptFilter}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Select all in department"
                    onClick={handleSelectAllDept}
                    disabled={deptFilter === "All"}
                  >
                    <UserCheck className="w-4 h-4" />
                  </Button>
                </div>
                
                <Select value={awardFilter} onValueChange={setAwardFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by award" />
                  </SelectTrigger>
                  <SelectContent>
                    {awards.map(award => <SelectItem key={award} value={award}>{award}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                <div className="md:col-span-2">
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
            </CardContent>
          </Card>

          {/* Recipients Table - Takes remaining height */}
          <Card className="flex-1 min-h-0 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recipients ({totalRecipients})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selected.length} selected</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={recipients.length === 0}
                  >
                    {selected.length === recipients.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex flex-col">
              {currentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading recipients...</p>
                  </div>
                </div>
              ) : recipients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No recipients found</p>
                  <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
                </div>
              ) : (
                <div className="flex-1 min-h-0 flex flex-col">
                  <ScrollArea className="flex-1">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox 
                              checked={selected.length === recipients.length && recipients.length > 0} 
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Award</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recipients.map(r => (
                          <TableRow key={r.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Checkbox 
                                checked={selected.includes(r.id)} 
                                onCheckedChange={() => handleSelect(r.id)} 
                              />
                            </TableCell>
                            <TableCell>
                              <button 
                                className="text-primary hover:underline font-medium" 
                                onClick={() => setDetailsRecipient(r)}
                              >
                                {r.name}
                              </button>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{r.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{r.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {r.department}
                              </div>
                            </TableCell>
                            <TableCell>
                              {r.award ? (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <Award className="w-3 h-3 mr-1" />
                                  {r.award}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(r.id)}
                            </TableCell>
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
                  
                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page === 1}>
                        Previous
                      </Button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page === totalPages}>
                        Next
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Rows per page:</span>
                      <select 
                        value={pageSize} 
                        onChange={handlePageSizeChange} 
                        className="border rounded px-2 py-1"
                      >
                        {[10, 20, 50, 100].map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                      <span className="text-muted-foreground">
                        {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalRecipients)} of {totalRecipients}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="mailmerge" className="h-full flex flex-col space-y-6">
          {/* Students Table for Mail Merge - Takes remaining height */}
          <Card className="flex-1 min-h-0 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Approved Graduating Students
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedStudents.length} selected</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={students.length === 0}
                  >
                    {selectedStudents.length === students.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex flex-col">
              {mailMergeLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading students...</p>
                  </div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No approved students found</p>
                  <p className="text-muted-foreground">Students need to be approved before they can receive invitations.</p>
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 w-12">
                          <Checkbox 
                            checked={selectedStudents.length === students.length && students.length > 0} 
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="text-left p-3">Student</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Program</th>
                        <th className="text-left p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-3">
                            <Checkbox 
                              checked={selectedStudents.includes(student.id)} 
                              onCheckedChange={() => handleSelect(student.id)} 
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                {student.gradPhoto ? (
                                  <AvatarImage 
                                    src={student.gradPhoto} 
                                    alt={student.name}
                                  />
                                ) : null}
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                {student.gradPhoto && (
                                  <p className="text-xs text-muted-foreground">Has photo</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{student.email}</td>
                          <td className="p-3">
                            <Badge variant="outline">{student.program}</Badge>
                          </td>
                          <td className="p-3">
                            {getStatusBadge(student.id)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>
        </div>

        {/* Invitation Editor - Common for both tabs */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-0">
                    {/* Editor */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 flex flex-col h-full">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b flex-shrink-0">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Invitation Content Editor</h3>
                  <p className="text-sm text-muted-foreground">Design your graduation invitation template</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 flex-1 min-h-0 flex flex-col">
              {/* Template Quick Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Quick Actions</h4>
                  <Badge variant="outline" className="text-xs">
                    {editorValue.length} characters
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditorValue(`# 🎓 Graduation Invitation

Dear {{name}},

🎉 **Congratulations on your graduation!**

We are delighted to invite you to the **Gordon College Graduation Ceremony**.

**Event Details:**
- 📅 **Date:** July 9, 2025
- 📍 **Location:** Subic Bay Exhibition and Convention Center
- ⏰ **Time:** 10:00 AM

Your graduation photo:
![Grad Photo]({{gradPhoto}})

**Special Recognition:** {{award}}

We look forward to celebrating this momentous achievement with you!

Best regards,  
**Gordon College Administration**`)}
                    className="border-blue-200 hover:bg-blue-50 text-xs"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const cursor = editorValue.length;
                      const template = "\n\n**Recipient:** {{name}}\n**Email:** {{email}}\n**Program:** {{program}}";
                      setEditorValue(editorValue + template);
                    }}
                    className="border-green-200 hover:bg-green-50 text-xs"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Add Info
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditorValue(editorValue + "\n\n![Grad Photo]({{gradPhoto}})")}
                    className="border-purple-200 hover:bg-purple-50 text-xs"
                  >
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Add Photo
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditorValue(editorValue + "\n\n**🏆 {{award}}**")}
                    className="border-yellow-200 hover:bg-yellow-50 text-xs"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    Add Award
                  </Button>
                </div>

                {/* Quick Insert Buttons */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Quick Insert:</span>
                    <Select onValueChange={(value) => setEditorValue(editorValue + value)}>
                      <SelectTrigger className="w-40 h-6 text-xs">
                        <SelectValue placeholder="Variables..." />
                      </SelectTrigger>
                                             <SelectContent>
                         <SelectItem value="{{name}}">{"{{name}}"} - Recipient name</SelectItem>
                         <SelectItem value="{{email}}">{"{{email}}"} - Email address</SelectItem>
                         <SelectItem value="{{program}}">{"{{program}}"} - Program/Department</SelectItem>
                         <SelectItem value="{{award}}">{"{{award}}"} - Award title</SelectItem>
                         <SelectItem value="![Grad Photo]({{gradPhoto}})">{"{{gradPhoto}}"} - Photo</SelectItem>
                       </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      {[
                        { emoji: "🎓", label: "Graduation" },
                        { emoji: "🎉", label: "Celebration" },
                        { emoji: "📅", label: "Date" },
                        { emoji: "📍", label: "Location" },
                        { emoji: "⏰", label: "Time" },
                        { emoji: "🏆", label: "Award" }
                      ].map((item) => (
                        <Button
                          key={item.emoji}
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditorValue(editorValue + item.emoji)}
                          className="h-6 px-2 text-xs hover:bg-blue-50"
                          title={`Add ${item.label} emoji`}
                        >
                          {item.emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor with enhanced styling */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Markdown Editor</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Live Preview ✨
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {previewRecipient ? 'Personalized' : 'Template'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(editorValue);
                        toast.success("Template copied to clipboard!");
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-1 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <MDEditor 
                    value={editorValue} 
                    onChange={v => setEditorValue(v || "")} 
                    height={450}
                    data-color-mode="light"
                    className="rounded-lg overflow-hidden"
                    visibleDragbar={false}
                    textareaProps={{
                      placeholder: "Start typing your graduation invitation template here...\n\nTip: Use {{name}}, {{email}}, {{program}}, {{award}}, and {{gradPhoto}} as placeholders.",
                      style: {
                        fontSize: 14,
                        lineHeight: 1.6,
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                      }
                    }}
                    preview="edit"
                    hideToolbar={false}
                  />
                </div>
                
                {/* Editor Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-blue-50/50 dark:bg-blue-950/20 rounded px-3 py-2">
                  <div className="flex items-center gap-4">
                    <span>📝 Words: {editorValue.split(/\s+/).filter(word => word.length > 0).length}</span>
                    <span>📄 Lines: {editorValue.split('\n').length}</span>
                    <span>🔧 Variables: {(editorValue.match(/\{\{[^}]+\}\}/g) || []).length}</span>
                    {previewRecipient && (
                      <span className="text-purple-600">👤 Preview: {previewRecipient.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">● Live Preview Active</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Placeholder Guide */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-blue-600 rounded">
                    <ImageIcon className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300">Template Variables</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Personal Information:</p>
                    <div className="flex flex-wrap gap-2">
                      {templateLegend.slice(0, 3).map((item) => (
                        <div key={item.var} className="flex items-center gap-1">
                          <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded border text-xs font-mono text-blue-600 dark:text-blue-400">
                            {item.var}
                          </code>
                          <span className="text-xs text-muted-foreground">({item.desc})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Special Elements:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded border text-xs font-mono text-purple-600 dark:text-purple-400">
                          {templateLegend[3].var}
                        </code>
                        <span className="text-xs text-muted-foreground">({templateLegend[3].desc})</span>
                      </div>
                                             <div className="flex items-center gap-1">
                         <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded border text-xs font-mono text-green-600 dark:text-green-400">
                           ![Grad Photo](&#123;&#123;gradPhoto&#125;&#125;)
                         </code>
                         <span className="text-xs text-muted-foreground">(Graduation photo)</span>
                       </div>
                    </div>
                  </div>
                </div>

                                  {/* Template Presets */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <h5 className="font-medium text-blue-800 dark:text-blue-300">Template Presets</h5>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditorValue(`# 🎓 Formal Graduation Invitation

Dear {{name}},

It is with great pleasure that we invite you to attend the **Gordon College Graduation Ceremony**.

**Graduate Details:**
- **Name:** {{name}}
- **Program:** {{program}}
- **Email:** {{email}}

![Graduation Photo]({{gradPhoto}})

**Academic Achievement:** {{award}}

**Ceremony Information:**
📅 **Date:** July 9, 2025
📍 **Venue:** Subic Bay Exhibition and Convention Center
⏰ **Time:** 10:00 AM

Your presence would honor us as we celebrate this significant milestone.

Sincerely,
**Gordon College Administration**`)}
                        className="text-left h-auto p-3 border-blue-200"
                      >
                        <div>
                          <p className="font-medium text-sm">Formal Style</p>
                          <p className="text-xs text-muted-foreground">Professional and traditional</p>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditorValue(`# 🎉 Celebration Invitation

Hey {{name}}! 🎓

**CONGRATULATIONS!** You did it! 🎊

We're throwing a graduation party and you're the star! ✨

![Your Amazing Grad Photo]({{gradPhoto}})

**You've earned:** {{award}} 🏆

**Party Details:**
🗓️ **When:** July 9, 2025 at 10:00 AM
🏢 **Where:** Subic Bay Exhibition and Convention Center
🎯 **Program:** {{program}}

Come celebrate with us - it's going to be AMAZING! 🎈

Can't wait to see you there!
**The Gordon College Team** 💙`)}
                        className="text-left h-auto p-3 border-green-200"
                      >
                        <div>
                          <p className="font-medium text-sm">Casual & Fun</p>
                          <p className="text-xs text-muted-foreground">Friendly and energetic</p>
                        </div>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800 dark:text-yellow-300">Pro Tips:</p>
                        <ul className="text-yellow-700 dark:text-yellow-400 mt-1 space-y-1 text-xs">
                          <li>• Use **bold** for emphasis and headers</li>
                          <li>• Add emojis (🎓📅📍⏰) to make it more engaging</li>
                          <li>• The preview will show how it looks to recipients</li>
                          <li>• Variables without values will be automatically hidden</li>
                          <li>• Try different presets above for inspiration</li>
                        </ul>
                      </div>
                    </div>
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-2 border-purple-200 dark:border-purple-800 flex flex-col h-full">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-b flex-shrink-0">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300">Live Preview</h3>
                  <p className="text-sm text-muted-foreground">See how your invitation will look</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 flex-1 min-h-0 flex flex-col">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Choose recipient to preview:
                  </label>
                  <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-1">
                    <Button
                      variant={previewMode === "rendered" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode("rendered")}
                      className="h-6 px-2 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Rendered
                    </Button>
                    <Button
                      variant={previewMode === "raw" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode("raw")}
                      className="h-6 px-2 text-xs"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Raw
                    </Button>
                  </div>
                </div>
                <Select 
                  value={previewRecipient?.id || ""} 
                  onValueChange={(value) => {
                    const recipient = currentData.find(r => r.id === value);
                    setPreviewRecipient(recipient || null);
                  }}
                >
                  <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400">
                    <SelectValue placeholder="🎓 Select a graduate to preview their invitation" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentData.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        <div className="flex items-center gap-3 py-1">
                          {(('gradPhoto' in r && (r as Student).gradPhoto) || ('gradPhotoUrl' in r && (r as Recipient).gradPhotoUrl)) && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={('gradPhoto' in r ? (r as Student).gradPhoto : (r as Recipient).gradPhotoUrl!)} />
                              <AvatarFallback>{r.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{r.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {'program' in r ? r.program : r.department}
                              {r.award && ` • ${r.award}`}
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div suppressHydrationWarning className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 border rounded-lg p-1 flex-1 min-h-0 overflow-y-auto">
                {previewRecipient ? (
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-6 h-full overflow-y-auto">
                    {previewMode === "rendered" ? (
                      <StyledCard>
                        <MarkdownPreview 
                          source={getPreviewMarkdown()} 
                          style={{ backgroundColor: 'transparent', color: 'inherit' }}
                          data-color-mode="light"
                          className={MARKDOWN_PREVIEW_CLASSES}
                        />
                      </StyledCard>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 dark:bg-gray-800 p-4 rounded border overflow-auto">
                        {getPreviewMarkdown()}
                      </pre>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center space-y-4">
                      <Eye className="w-12 h-12 mx-auto opacity-50" />
                      <p>Select a recipient to preview the invitation</p>
                      <p className="text-xs">The preview will show your markdown template with real data</p>
                      <p className="text-xs mt-2">Use the toggle above to switch between rendered and raw markdown</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Action Buttons */}
        <Card>
          <CardContent className="flex flex-wrap gap-4 p-6">
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={currentSelected.length !== 1}>
                  <Eye className="w-4 h-4 mr-2" /> 
                  Preview Single
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Invitation Preview</DialogTitle>
                </DialogHeader>
                <div suppressHydrationWarning className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 border rounded-lg p-1">
                  {currentSelected.length === 1 && previewRecipient ? (
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-h-[70vh] overflow-y-auto">
                      <StyledCard>
                        <MarkdownPreview 
                          source={getPreviewMarkdown()} 
                          style={{ backgroundColor: 'transparent', color: 'inherit' }}
                          data-color-mode="light"
                          className={MARKDOWN_PREVIEW_CLASSES}
                        />
                      </StyledCard>
                    </div>
                  ) : (
                    <div className="text-muted-foreground p-8 text-center">
                      <p>Select a single recipient to preview personalized invitation.</p>
                      <p className="text-xs mt-2">The preview will render your markdown template with actual recipient data.</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={previewAllOpen} onOpenChange={setPreviewAllOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={currentSelected.length === 0}>
                  <Eye className="w-4 h-4 mr-2" /> 
                  Preview All ({currentSelected.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Preview All Invitations ({currentSelected.length})</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[75vh]">
                  <div className="space-y-8">
                    {currentSelected.map(id => {
                      const rec = currentData.find(r => r.id === id);
                      if (!rec) return null;
                      return (
                        <div key={id} className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            {(('gradPhoto' in rec && (rec as Student).gradPhoto) || ('gradPhotoUrl' in rec && (rec as Recipient).gradPhotoUrl)) && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={('gradPhoto' in rec ? (rec as Student).gradPhoto : (rec as Recipient).gradPhotoUrl!)} />
                                <AvatarFallback>{rec.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold">{rec.name}</p>
                              <p className="text-sm text-muted-foreground">{rec.email}</p>
                            </div>
                            {rec.award && <Badge variant="secondary">{rec.award}</Badge>}
                          </div>
                          <div suppressHydrationWarning className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 border rounded-lg p-1">
                            <StyledCard>
                              <MarkdownPreview 
                                source={replaceVars(editorValue, rec)} 
                                style={{ backgroundColor: 'transparent', color: 'inherit' }}
                                data-color-mode="light"
                                className={MARKDOWN_PREVIEW_CLASSES}
                              />
                            </StyledCard>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button 
                  disabled={currentSelected.length === 0 || sending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending {successCount}/{currentSelected.length}...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitations ({currentSelected.length})
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Confirm Send Invitations
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Event Summary */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Event Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>July 9, 2025 at 10:00 AM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>Subic Bay Exhibition and Convention Center</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipients Summary */}
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Recipients</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-green-600" />
                      <span><strong>{currentSelected.length}</strong> {activeTab === "general" ? "recipients" : "graduating students"} selected</span>
                    </div>
                    {activeTab === "mailmerge" && (
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <ImageIcon className="w-4 h-4 text-green-600" />
                        <span>Including graduation photos</span>
                      </div>
                    )}
                  </div>

                  {/* Template Preview */}
                  <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Template Info</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span>{editorValue.split(/\s+/).filter(word => word.length > 0).length} words</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 text-purple-600">🎯</span>
                        <span>{(editorValue.match(/\{\{[^}]+\}\}/g) || []).length} personalization variables</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation */}
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Are you sure you want to send personalized graduation invitations to <strong>{currentSelected.length}</strong> recipient(s)?
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      This action cannot be undone.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button 
                      onClick={handleSend} 
                      disabled={sending}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {sending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Yes, Send Now
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setConfirmOpen(false)}
                      disabled={sending}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="secondary" 
              disabled={currentSelected.length === 0} 
              onClick={exportToPDF}
            >
              <Download className="w-4 h-4 mr-2" /> 
              Export as PDF ({currentSelected.length})
            </Button>
          </CardContent>
        </Card>

        {/* Recipient Details Modal */}
        <Dialog open={!!detailsRecipient} onOpenChange={() => setDetailsRecipient(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recipient Details</DialogTitle>
            </DialogHeader>
            {detailsRecipient && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <strong>Name:</strong> {detailsRecipient.name}
                </div>
                <div className="flex items-center gap-2">
                  <strong>Email:</strong> {detailsRecipient.email}
                </div>
                <div className="flex items-center gap-2">
                  <strong>Role:</strong> 
                  <Badge variant="outline">{detailsRecipient.role}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <strong>Department:</strong> {detailsRecipient.department}
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <strong>Award:</strong> {detailsRecipient.award || "None"}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        </Tabs>
      </div>
    </div>
  );
} 

// Helper to wrap rendered markdown in dark-theme card (matches StyledCard)
function generateInvitationHtmlFromMarkdown(renderedHtml: string) {
  return `
  <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 12px; padding: 4px; width: 100%; font-family: 'Inter', Arial, sans-serif; color:#f8fafc;">
    <style>
      img { max-width: 140mm; height: auto; display:block; margin: 0 auto; }
    </style>
    <div style="background:#0f172a;border-radius:8px;position:relative;padding:40px;min-height:auto;overflow:visible;">
      <div style="position:absolute;top:0;left:0;width:100%;height:8px;background:linear-gradient(90deg,#3b82f6 0%,#8b5cf6 50%,#3b82f6 100%);"></div>
      <div style="position:absolute;top:8px;left:0;width:100%;height:4px;background:linear-gradient(90deg,#fbbf24 0%,#f59e0b 50%,#fbbf24 100%);"></div>
      <div style="position:relative;z-index:10;">
        ${renderedHtml}
      </div>
      <div style="position:absolute;bottom:0;left:0;width:100%;height:8px;background:linear-gradient(90deg,#3b82f6 0%,#8b5cf6 50%,#3b82f6 100%);"></div>
    </div>
  </div>`;
}
