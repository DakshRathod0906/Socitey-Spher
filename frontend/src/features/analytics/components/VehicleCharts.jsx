import React from "react";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from "recharts";
import { assignColors } from "../utils/chartTransformers";

import { Car } from "lucide-react";

const EmptyChartState = ({ message = "No vehicle records logged yet" }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
      <Car className="w-6 h-6 text-gray-300" />
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

const VehicleCharts = ({ vehicles }) => {
  const rawType = vehicles?.typeDistribution || [];
  const typeData = assignColors(rawType);
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Vehicles</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Type Breakdown */}
        <ChartContainer title="Vehicle Types" hasData={typeData.length > 0} emptyMessage="No vehicle type data recorded yet">
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
