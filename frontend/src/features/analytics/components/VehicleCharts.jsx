import React from "react";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from "recharts";
import { assignColors } from "../utils/chartTransformers";

const ChartContainer = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-96">
    <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
    <div className="flex-1 w-full h-full min-h-0">
      {children}
    </div>
  </div>
);

const VehicleCharts = ({ vehicles }) => {
  if (!vehicles) return null;

  const typeData = assignColors(vehicles.typeDistribution);
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Vehicles</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Type Breakdown */}
        <ChartContainer title="Vehicle Types">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
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

      </div>
    </div>
  );
};

export default VehicleCharts;
