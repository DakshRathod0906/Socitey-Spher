import React from "react";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";
import { assignStatusColors, assignColors } from "../utils/chartTransformers";
import { CHART_COLORS } from "../constants/chartColors";

const ChartContainer = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-96">
    <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
    <div className="flex-1 w-full h-full min-h-0">
      {children}
    </div>
  </div>
);

const ComplaintCharts = ({ complaints }) => {
  if (!complaints) return null;

  const statusData = assignStatusColors(complaints.statusDistribution, "status");
  const categoryData = assignColors(complaints.categoryDistribution);
  const trendData = complaints.monthlyTrend;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Complaints</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Pie Chart */}
        <ChartContainer title="Status Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Category Bar Chart */}
        <ChartContainer title="Category Breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" tick={{fontSize: 12}} />
              <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Monthly Trend Line Chart */}
        <ChartContainer title="Monthly Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{fontSize: 12}} />
              <YAxis />
              <RechartsTooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={CHART_COLORS.primary} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

      </div>
    </div>
  );
};

export default ComplaintCharts;
