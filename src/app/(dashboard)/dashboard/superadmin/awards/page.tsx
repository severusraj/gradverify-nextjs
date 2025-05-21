"use client";

import { useState } from "react";
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
import { Award, Search, Plus, MoreHorizontal, FileCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data - Replace with real API data
const awardCategories = [
  { id: 1, name: "Academic Excellence", description: "Outstanding academic performance" },
  { id: 2, name: "Leadership", description: "Exceptional leadership qualities" },
  { id: 3, name: "Research", description: "Notable research contributions" },
  { id: 4, name: "Community Service", description: "Significant community impact" },
  { id: 5, name: "Sports Achievement", description: "Excellence in sports" },
];

const awardRecipients = [
  {
    id: "AW001",
    studentName: "John Doe",
    studentId: "2020-00123",
    department: "College of Computer Studies",
    award: "Academic Excellence",
    year: "2024",
    status: "verified",
  },
  {
    id: "AW002",
    studentName: "Jane Smith",
    studentId: "2020-00124",
    department: "College of Business",
    award: "Leadership",
    year: "2024",
    status: "pending",
  },
  // Add more mock data
];

export default function AwardsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredRecipients = awardRecipients.filter((recipient) => {
    const matchesSearch =
      searchQuery === "" ||
      recipient.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.studentId.includes(searchQuery);
    const matchesCategory =
      selectedCategory === "all" || recipient.award === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Awards Management</h1>
          <p className="text-muted-foreground">
            Manage and verify student awards and achievements
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Award
        </Button>
      </div>

      {/* Award Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {awardCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {category.name}
              </CardTitle>
              <Award className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </CardContent>
          </Card>
        ))}
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
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {awardCategories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Awards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Award Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Award Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipients.map((recipient) => (
                  <TableRow key={recipient.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{recipient.studentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {recipient.studentId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{recipient.award}</TableCell>
                    <TableCell>{recipient.department}</TableCell>
                    <TableCell>{recipient.year}</TableCell>
                    <TableCell>
                      <Badge
                        variant={recipient.status === "verified" ? "default" : "secondary"}
                      >
                        {recipient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileCheck className="w-4 h-4 mr-2" />
                            Verify Award
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Award</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Remove Award
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 