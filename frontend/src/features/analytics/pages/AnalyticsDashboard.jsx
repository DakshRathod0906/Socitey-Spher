import React from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { useAnalytics } from "../hooks/useAnalytics";
import PipelineStatus from "../components/PipelineStatus";
import KPICards from "../components/KPICards";
import ComplaintCharts from "../components/ComplaintCharts";
import ExpenseCharts from "../components/ExpenseCharts";
import VisitorCharts from "../components/VisitorCharts";
import VehicleCharts from "../components/VehicleCharts";

const AnalyticsDashboard = () => {
  const { 
    loading, error, refresh,
    dashboard, pipeline, complaints, expenses, visitors, vehicles 
  } = useAnalytics();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-500 text-lg">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="p-4 bg-red-50 rounded-full mb-4">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load analytics</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button 
          onClick={refresh}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Historical insights and trends for SocietySphere
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Last Updated</p>
            <p className="text-sm font-medium text-gray-900">
              {dashboard?.last_updated ? new Date(dashboard.last_updated).toLocaleString() : "Unknown"}
            </p>
          </div>
          <button 
            onClick={refresh}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      <PipelineStatus pipeline={pipeline} />
      
      <KPICards dashboard={dashboard?.kpis} />
      
      <div className="space-y-4">
        <ComplaintCharts complaints={complaints} />
        <ExpenseCharts expenses={expenses} />
        <VisitorCharts visitors={visitors} />
        <VehicleCharts vehicles={vehicles} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
