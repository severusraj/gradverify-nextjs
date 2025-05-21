"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users2, Building2, ChevronDown, ChevronRight } from "lucide-react";
import { CreateUserDialog } from "@/components/dialogs/create-user-dialog";
import { UserManagementTable } from "@/components/tables/user-management-table";
import { ScrollArea } from "@/components/ui/scroll-area";

// Real department data from student submissions
const departments = [
  {
    name: "College of Allied Health Studies (CAHS)",
    programs: [
      "BS in Nursing",
      "BS in Midwifery",
    ],
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
  {
    name: "College of Computer Studies (CCS)",
    programs: [
      "BS in Computer Science",
      "BS in Entertainment and Multimedia Computing",
      "BS in Information Technology",
    ],
  },
  {
    name: "College of Education, Arts, and Sciences (CEAS)",
    programs: [
      "BA in Communication",
      "BS in Early Childhood Education",
      "BS in Culture and Arts Education",
      "BS in Physical Education",
      "BS in Elementary Education (General Education)",
      "BS in Secondary Education major in English",
      "BS in Secondary Education major in Filipino",
      "BS in Secondary Education major in Mathematics",
      "BS in Secondary Education major in Social Studies",
      "BS in Secondary Education major in Sciences",
    ],
  },
  {
    name: "College of Hospitality and Tourism Management (CHTM)",
    programs: [
      "BS in Hospitality Management",
      "BS in Tourism Management",
    ],
  },
];

export default function UserManagementPage() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [expandedDepartments, setExpandedDepartments] = useState<string[]>([]);

  const toggleDepartment = (deptName: string) => {
    setExpandedDepartments(prev => 
      prev.includes(deptName) 
        ? prev.filter(d => d !== deptName)
        : [...prev, deptName]
    );
  };

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage administrators, faculty members, and departments.
          </p>
        </div>
        <Button onClick={() => setIsCreateUserOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center">
            <Users2 className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
            Departments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <UserManagementTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Departments & Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {departments.map((dept) => (
                    <div key={dept.name} className="border rounded-lg">
                      <button
                        onClick={() => toggleDepartment(dept.name)}
                        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{dept.name}</span>
                        </div>
                        {expandedDepartments.includes(dept.name) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {expandedDepartments.includes(dept.name) && (
                        <div className="px-4 pb-4">
                          <div className="space-y-2 mt-2 border-l-2 border-secondary ml-2">
                            {dept.programs.map((program) => (
                              <div
                                key={program}
                                className="flex items-center gap-2 pl-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {program}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <CreateUserDialog 
        open={isCreateUserOpen}
        onOpenChange={setIsCreateUserOpen}
      />
    </div>
  );
} 