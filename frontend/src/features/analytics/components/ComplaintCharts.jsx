import React from "react";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";
import { assignStatusColors, assignColors } from "../utils/chartTransformers";
import { CHART_COLORS } from "../constants/chartColors";

import { Inbox } from "lucide-react";

const EmptyChartState = ({ message = "No records logged yet" }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
      <Inbox className="w-6 h-6 text-gray-300" />
    </div>
    <p className="text-sm font-medium text-gray-500">{message}</p>
    <p className="text-xs text-gray-400 mt-1">0 records found in database</p>
  </div>
);

const ChartContainer = ({ title, children, hasData = true, emptyMessage }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-96">
    <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
    <div className="flex-1 w-full h-full min-h-0">
      {hasData ? children : <EmptyChartState message={emptyMessage} />}
    </div>
  </div>
);

const ComplaintCharts = ({ complaints }) => {
  const rawStatus = complaints?.statusDistribution || [];
  const rawCategory = complaints?.categoryDistribution || [];
  const trendData = complaints?.monthlyTrend || [];

  const statusData = assignStatusColors(rawStatus, "status");
  const categoryData = assignColors(rawCategory);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Complaints</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Pie Chart */}
        <ChartContainer title="Status Distribution" hasData={statusData.length > 0} emptyMessage="No complaints status logged yet">
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
        <ChartContainer title="Category Breakdown" hasData={categoryData.length > 0} emptyMessage="No complaint categories logged yet">
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
        <ChartContainer title="Monthly Trend" hasData={trendData.length > 0} emptyMessage="No monthly trend logged yet">
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
