import React from "react";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { assignColors } from "../utils/chartTransformers";
import { CHART_COLORS } from "../constants/chartColors";

const ChartContainer = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-96">
    <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
    <div className="flex-1 w-full h-full min-h-0">
      {children}
    </div>
  </div>
);

const VisitorCharts = ({ visitors }) => {
  if (!visitors) return null;

  const typeData = assignColors(visitors.typeDistribution);
  const trendData = visitors.monthlyTrend;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Visitors</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Type Breakdown */}
        <ChartContainer title="Visitor Types">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Monthly Visits */}
        <ChartContainer title="Monthly Visits">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{fontSize: 12}} />
              <YAxis />
              <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="count" fill={CHART_COLORS.info} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

      </div>
    </div>
  );
};

export default VisitorCharts;
