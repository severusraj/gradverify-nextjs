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
import { getSuperadminAnalytics } from "@/actions/superadmin-analytics.actions";

// Color palette reused
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const departmentPrograms: Record<string, string[]> = {
  "College of Allied Health Studies (CAHS)": ["BS in Nursing", "BS in Midwifery"],
  "College of Business and Accountancy (CBA)": [
    "BS in Accountancy",
    "BS in Business Administration Major in Financial Management",
    "BS in Business Administration Major in Human Resource Management",
    "BS in Business Administration Major in Marketing Management",
    "BS in Customs Administration",
  ],
  "College of Computer Studies (CCS)": [
    "BS in Computer Science",
    "BS in Entertainment and Multimedia Computing",
    "BS in Information Technology",
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
    "BS in Secondary Education major in Sciences",
  ],
  "College of Hospitality and Tourism Management (CHTM)": ["BS in Hospitality Management", "BS in Tourism Management"],
};

const getAcronym = (name: string) => {
  const match = name.match(/\(([^)]+)\)/);
  return match ? match[1] : name;
};

interface AnalyticsChartsClientProps {
  initialRange?: "7days" | "30days" | "90days";
  initialData: any;
}

export default function AnalyticsChartsClient({ initialRange = "30days", initialData }: AnalyticsChartsClientProps) {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">(initialRange);
  const [data, setData] = useState<any>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(Object.keys(departmentPrograms)[0]);

  // Refetch when range changes (skip if same as initial range)
  useEffect(() => {
    if (timeRange === initialRange) return;

    setLoading(true);
    (async () => {
      const result = await getSuperadminAnalytics(timeRange);
      setData(result);
      setLoading(false);
    })().catch(() => {
      setError("Failed to load analytics data");
      setLoading(false);
    });
  }, [timeRange, initialRange]);

  if (loading) return <div className="p-8">Loading analytics…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">No analytics data available</div>;

  // --- Data transformations (same as before) ---
  const departmentData = Object.entries(data.departmentStats).map(([name, value]) => ({ name, value }));
  const documentTypes = data.documentTypes || [];
  const dailyData = data.dailyTrends || [];
  const processingTimes = data.processingTimes || [];

  const filteredPrograms = departmentPrograms[selectedDepartment] || [];
  const filteredProcessingTimes = processingTimes.filter((pt: any) => filteredPrograms.includes(pt.program));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Verification Trends */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle>Verification Trends</CardTitle>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-full md:w-[180px] bg-gray-800 border-gray-600 mt-4 lg:mt-0">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
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
      <Card className="bg-gray-900 border-gray-700">
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
                  label={({ name, percent }) => `${getAcronym(name)} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#4b5563",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Document Types */}
      <Card className="bg-gray-900 border-gray-700">
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
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle>Processing Time Analysis</CardTitle>
          <div className="mt-2">
            <Select value={selectedDepartment} onValueChange={(v) => setSelectedDepartment(v)}>
              <SelectTrigger className="w-full md:w-[320px] bg-gray-800 border-gray-600">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(departmentPrograms).map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
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
                  {pt.avgProcessingDays != null ? `${pt.avgProcessingDays.toFixed(1)} days avg.` : "No data"}
                </span>
                <div className="w-1/2 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: pt.avgProcessingDays ? `${Math.min(100, pt.avgProcessingDays * 20)}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 