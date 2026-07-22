import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart2, MessageSquare, Users, IndianRupee } from "lucide-react";
import { analyticsApi } from "../services/analyticsApi";

const QuickAnalyticsCard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await analyticsApi.getDashboard();
        setDashboard(data);
      } catch (error) {
        console.error("Failed to fetch quick analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-500" />
          Quick Analytics
        </h2>
        <Link 
          to="/admin/analytics" 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View Full Analytics &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : dashboard ? (
        <div className="grid grid-cols-1 gap-4 flex-1">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Complaints</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{dashboard.kpis?.total_complaints || 0}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Visitors</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{dashboard.kpis?.total_visitors || 0}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <IndianRupee className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Expenses</span>
            </div>
            <span className="text-lg font-bold text-gray-900">₹{(dashboard.kpis?.total_expenses || 0).toLocaleString()}</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
          Analytics data unavailable
        </div>
      )}
    </div>
  );
};

export default QuickAnalyticsCard;
