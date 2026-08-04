import { useState, useEffect, useCallback } from "react";
import { analyticsApi } from "../services/analyticsApi";

export const useAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [dashboard, setDashboard] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [complaints, setComplaints] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [visitors, setVisitors] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [users, setUsers] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dashData = await analyticsApi.getDashboard();
      
      if (dashData) {
        setDashboard(dashData);
        setPipeline(dashData.pipeline);
        setComplaints(dashData.complaints);
        setExpenses(dashData.expenses);
        setVisitors(dashData.visitors);
        setVehicles(dashData.vehicles);
        setUsers(dashData.users);
      } else {
        // Fallback individual requests if unified endpoint is unavailable
        const [compData, expData, visData, vehData, usrData, pipeData] = await Promise.all([
          analyticsApi.getComplaintsSummary(),
          analyticsApi.getExpensesSummary(),
          analyticsApi.getVisitorsSummary(),
          analyticsApi.getVehiclesSummary(),
          analyticsApi.getUsersSummary(),
          analyticsApi.getPipeline(),
        ]);
        setComplaints(compData);
        setExpenses(expData);
        setVisitors(visData);
        setVehicles(vehData);
        setUsers(usrData);
        setPipeline(pipeData);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch live analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    loading,
    error,
    dashboard,
    pipeline,
    complaints,
    expenses,
    visitors,
    vehicles,
    users,
    refresh: fetchAll
  };
};
