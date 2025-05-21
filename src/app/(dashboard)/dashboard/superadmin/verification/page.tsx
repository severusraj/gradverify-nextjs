"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Real department data from student submissions
const departments = [
  {
    name: "College of Allied Health Studies (CAHS)",
    programs: ["BS in Nursing", "BS in Midwifery"],
  },
  {
    name: "College of Business and Accountancy (CBA)",
    programs: [
      "BS in Accountancy",
      "BS in Business Administration Major in Financial Management",
      "BS in Business Administration Major in Human Resource Management",
      "BS in Business Administration Major in Marketing Management",
      "BS in Customs Administration",
    ],
  },
  // ... other departments
];

// Mock verification data - replace with real API data
const verificationRequests = [
  {
    id: "VR001",
    student: {
      name: "John Doe",
      id: "2020-00123",
      department: "College of Computer Studies (CCS)",
      program: "BS in Computer Science",
    },
    type: "Graduation Requirements",
    documents: ["PSA Certificate", "Graduation Photo", "Academic Awards"],
    status: "pending",
    submittedAt: "2024-05-20T10:30:00",
    assignedTo: null,
  },
  {
    id: "VR002",
    student: {
      name: "Jane Smith",
      id: "2020-00124",
      department: "College of Business and Accountancy (CBA)",
      program: "BS in Accountancy",
    },
    type: "Awards Verification",
    documents: ["Academic Awards", "Certificates"],
    status: "in_progress",
    submittedAt: "2024-05-20T09:15:00",
    assignedTo: "Dr. Anderson",
  },
  // Add more mock data
];

export default function VerificationManagementPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRequests = verificationRequests.filter((request) => {
    const matchesSearch =
      searchQuery === "" ||
      request.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.student.id.includes(searchQuery);
    const matchesDepartment =
      selectedDepartment === "all" ||
      request.student.department === selectedDepartment;
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Verification Management</h1>
        <p className="text-muted-foreground">
          Review and process student verification requests
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.name} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Verification Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{request.student.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {request.student.id}
                        </span>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(request.status)}
                        >
                          {request.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {request.student.department} • {request.student.program}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {request.documents.map((doc) => (
                          <Badge key={doc} variant="outline">
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Assign Reviewer</DropdownMenuItem>
                          <DropdownMenuItem>Approve Request</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Reject Request
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {request.assignedTo && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Assigned to: {request.assignedTo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 