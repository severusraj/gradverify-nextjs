"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart as ReLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

// Static mapping of departments to programs
const departmentPrograms: Record<string, string[]> = {
  "College of Allied Health Studies (CAHS)": ["BS in Nursing", "BS in Midwifery"],
  "College of Business and Accountancy (CBA)": [
    "BS in Accountancy",
    "BS in Business Administration Major in Financial Management",
    "BS in Business Administration Major in Human Resource Management",
    "BS in Business Administration Major in Marketing Management",
    "BS in Customs Administration"
  ],
  "College of Computer Studies (CCS)": [
    "BS in Computer Science",
    "BS in Entertainment and Multimedia Computing",
    "BS in Information Technology"
  ],
  "College of Education, Arts, and Sciences (CEAS)": [
    "BA in Communication",
    "BS in Early Childhood Education",
    "BS in Culture and Arts Education",
    "BS in Physical Education",
    "BS in Elementary Education (General Education)",
    "BS in Secondary Education major in English",
    "BS in Secondary Education major in Filipino",
    "BS in Secondary Education major in Mathematics",
    "BS in Secondary Education major in Social Studies",
    "BS in Secondary Education major in Sciences"
  ],
  "College of Hospitality and Tourism Management (CHTM)": [
    "BS in Hospitality Management",
    "BS in Tourism Management"
  ]
};

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30days");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(Object.keys(departmentPrograms)[0]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/superadmin/analytics?range=${timeRange}`)
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load analytics data");
        setLoading(false);
      });
  }, [timeRange]);

  if (loading) return <div className="p-8">Loading analytics...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">No analytics data available</div>;

  // Summary values
  const totalSubmissions = Object.values(data.verificationStats).reduce((a, b) => Number(a) + Number(b), 0);
  const approved = Number(data.verificationStats.APPROVED || 0);
  const approvalRate = Number(totalSubmissions) ? ((Number(approved) / Number(totalSubmissions)) * 100).toFixed(1) : "0";
  const avgProcessingTime = data.processingTimes && data.processingTimes.length
    ? (data.processingTimes.map((p: any) => p.avgProcessingDays || 0).reduce((a: number, b: number) => a + b, 0) / data.processingTimes.length).toFixed(1)
    : "N/A";
  const activeVerifiers = data.activeVerifiers || 0;

  // Trends and charts
  const dailyData = data.dailyTrends || [];
  const departmentData = Object.entries(data.departmentStats).map(([name, value]) => ({ name, value }));
  const documentTypes = data.documentTypes || [];
  const processingTimes = data.processingTimes || [];

  // Filter processingTimes by selected department
  const filteredPrograms = departmentPrograms[selectedDepartment] || [];
  const filteredProcessingTimes = processingTimes.filter((pt: any) => filteredPrograms.includes(pt.program));

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into verification processes and trends
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(totalSubmissions)}</div>
            <p className="text-xs text-muted-foreground">Total verification requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">% of requests approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProcessingTime} days</div>
            <p className="text-xs text-muted-foreground">Across all document types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Verifiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVerifiers}</div>
            <p className="text-xs text-muted-foreground">Admins/faculty in last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="submissions" stroke="#8884d8" name="Submissions" />
                  <Line type="monotone" dataKey="approved" stroke="#82ca9d" name="Approved" />
                  <Line type="monotone" dataKey="rejected" stroke="#ff7c7c" name="Rejected" />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Document Types */}
        <Card>
          <CardHeader>
            <CardTitle>Document Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={documentTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Number of Documents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Processing Time Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Time Analysis</CardTitle>
            <div className="mt-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[320px]">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(departmentPrograms).map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProcessingTimes.length === 0 && (
                <div className="text-muted-foreground">No programs found for this department.</div>
              )}
              {filteredProcessingTimes.map((pt: any, idx: number) => (
                <div key={pt.program || idx} className="flex justify-between items-center">
                  <span>{pt.program}</span>
                  <span className="font-medium">
                    {pt.avgProcessingDays != null
                      ? `${pt.avgProcessingDays.toFixed(1)} days avg.`
                      : "No data"}
                  </span>
                  <div className="w-1/2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: pt.avgProcessingDays ? `${Math.min(100, pt.avgProcessingDays * 20)}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 