"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart,
  Users,
  Award,
} from "lucide-react";

// Mock data - Replace with real API data
const reportTypes = [
  {
    id: "verification",
    name: "Verification Reports",
    description: "Detailed reports on document verification status and trends",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "department",
    name: "Department Reports",
    description: "Analysis by department and program performance",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "awards",
    name: "Awards Reports",
    description: "Summary of awarded achievements and honors",
    icon: <Award className="w-4 h-4" />,
  },
  {
    id: "analytics",
    name: "Analytics Reports",
    description: "Statistical analysis and trends over time",
    icon: <BarChart className="w-4 h-4" />,
  },
];

const recentReports = [
  {
    id: "R001",
    name: "Monthly Verification Summary",
    type: "Verification",
    date: "2024-02-20",
    status: "Generated",
  },
  {
    id: "R002",
    name: "Department Performance Q1",
    type: "Department",
    date: "2024-02-19",
    status: "Processing",
  },
  {
    id: "R003",
    name: "Academic Awards 2024",
    type: "Awards",
    date: "2024-02-18",
    status: "Generated",
  },
];

export default function ReportsManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedFormat, setSelectedFormat] = useState("pdf");

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Reports Management</h1>
        <p className="text-muted-foreground">
          Generate and manage system reports and analytics
        </p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <Card key={type.id} className="hover:bg-secondary/50 cursor-pointer transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {type.name}
              </CardTitle>
              {type.icon}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {type.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>

              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {report.type} • {report.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {report.status}
                    </span>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Report Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Monthly Verification Summary</div>
                  <div className="text-sm text-muted-foreground">
                    Generates on the 1st of every month
                  </div>
                </div>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Weekly Department Stats</div>
                  <div className="text-sm text-muted-foreground">
                    Generates every Monday at 6:00 AM
                  </div>
                </div>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 