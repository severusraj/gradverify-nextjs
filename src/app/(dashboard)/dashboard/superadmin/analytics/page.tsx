"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
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
import { format, subDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data - Replace with real API data
const generateDailyData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), "MMM dd"),
    submissions: Math.floor(Math.random() * 50) + 10,
    approved: Math.floor(Math.random() * 30) + 5,
    rejected: Math.floor(Math.random() * 10),
  }));
};

const departmentData = [
  { name: "CAHS", value: 120 },
  { name: "CBA", value: 180 },
  { name: "CCS", value: 150 },
  { name: "CEAS", value: 200 },
  { name: "CHTM", value: 90 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const documentTypes = [
  { type: "PSA Certificate", count: 250 },
  { type: "Graduation Photo", count: 220 },
  { type: "Academic Awards", count: 80 },
  { type: "Other Documents", count: 50 },
];

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30days");
  const dailyData = generateDailyData();

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
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">+12.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76.4%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 days</div>
            <p className="text-xs text-muted-foreground">-0.8 days from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Verifiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
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
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="submissions" stroke="#8884d8" name="Submissions" />
                  <Line type="monotone" dataKey="approved" stroke="#82ca9d" name="Approved" />
                  <Line type="monotone" dataKey="rejected" stroke="#ff7c7c" name="Rejected" />
                </LineChart>
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
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>PSA Certificate</span>
                <span className="font-medium">2.1 days avg.</span>
                <div className="w-1/2 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "70%" }} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Graduation Photo</span>
                <span className="font-medium">1.5 days avg.</span>
                <div className="w-1/2 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "85%" }} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Academic Awards</span>
                <span className="font-medium">3.2 days avg.</span>
                <div className="w-1/2 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "55%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 