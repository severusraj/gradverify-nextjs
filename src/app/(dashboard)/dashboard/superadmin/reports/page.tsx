"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  BarChart,
  Users,
  Award,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { getSuperadminReport, exportSuperadminReport } from "@/actions/superadmin-reports.actions";

interface ReportData {
  verificationStats?: any[];
  avgProcessingTimes?: any[];
  documentTypes?: any[];
  departmentStats?: any[];
  programStats?: any[];
  studentCounts?: any[];
  awardStats?: any[];
  departmentAwards?: any[];
  recentAwards?: any[];
  userStats?: any[];
  recentActivity?: any[];
  recentVerifications?: any[];
}

export default function ReportsManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchReports();
  }, [selectedType, selectedPeriod]);

  const fetchReports = async () => {
    if (!selectedType) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getSuperadminReport({ type: selectedType, period: selectedPeriod });
      setReportData(result);
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedType) return;
    setLoading(true);
    setError(null);
    try {
      const result = await exportSuperadminReport({
        type: selectedType,
        period: selectedPeriod,
        formatType: selectedFormat,
      });
      if (!result.base64) throw new Error("Failed to generate report");
      // Convert base64 to Blob
      const byteCharacters = atob(result.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8 text-red-600">
          Error: {error}
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="p-8 text-muted-foreground">
          Select a report type to view data
        </div>
      );
    }

    switch (selectedType) {
      case "verification":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.verificationStats?.map((stat, idx) => (
                    <div key={`${stat.status}-${idx}`} className="flex justify-between items-center">
                      <span>{stat.status}</span>
                      <span className="font-medium">{stat._count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Processing Times by Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.avgProcessingTimes?.map((time, idx) => (
                    <div key={`${time.program}-${idx}`} className="flex justify-between items-center">
                      <span>{time.program}</span>
                      <span className="font-medium">{time.avgProcessingDays.toFixed(1)} days</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "department":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.departmentStats?.map((stat, idx) => (
                    <div key={`${stat.department}-${idx}`} className="flex justify-between items-center">
                      <span>{stat.department}</span>
                      <span className="font-medium">{stat._count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Program Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.programStats?.map((stat, idx) => (
                    <div key={`${stat.program}-${idx}`} className="flex justify-between items-center">
                      <span>{stat.program}</span>
                      <span className="font-medium">{stat._count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "awards":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Award Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.awardStats?.map((stat, idx) => (
                    <div key={`${stat.status}-${idx}`} className="flex justify-between items-center">
                      <span>{stat.status}</span>
                      <span className="font-medium">{stat._count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Awards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.recentAwards?.map((award, idx) => (
                    <div key={award.id ?? idx} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {award.user?.name ?? <span className="text-red-500">No Name</span>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {award.user?.email ?? <span className="text-red-500">No Email</span>}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {award.updatedAt ? format(new Date(award.updatedAt), "MMM d, yyyy") : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.userStats?.map((stat, idx) => (
                    <div key={`${stat.role}-${idx}`} className="flex justify-between items-center">
                      <span>{stat.role}</span>
                      <span className="font-medium">{stat._count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.recentActivity?.map((activity, idx) => (
                    <div key={activity.id ?? idx} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {activity.user?.name ?? <span className="text-red-500">No Name</span>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activity.action ?? <span className="text-red-500">No Action</span>}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.createdAt ? format(new Date(activity.createdAt), "MMM d, yyyy") : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

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
          <Card 
            key={type.id} 
            className={`hover:bg-secondary/50 cursor-pointer transition-colors ${
              selectedType === type.id ? "bg-secondary" : ""
            }`}
            onClick={() => setSelectedType(type.id)}
          >
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

              <Button 
                className="w-full" 
                onClick={handleGenerateReport}
                disabled={!selectedType || loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                <Download className="w-4 h-4 mr-2" />
                )}
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedType ? `${reportTypes.find(t => t.id === selectedType)?.name} - ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Report` : "Select a Report Type"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderReportContent()}
        </CardContent>
      </Card>
    </div>
  );
} 