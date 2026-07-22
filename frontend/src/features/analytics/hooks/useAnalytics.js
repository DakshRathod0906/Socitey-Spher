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

      const [
        dashData,
        pipeData,
        compData,
        expData,
        visData,
        vehData,
        usrData
      ] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getPipeline(),
        analyticsApi.getComplaintsSummary(),
        analyticsApi.getExpensesSummary(),
        analyticsApi.getVisitorsSummary(),
        analyticsApi.getVehiclesSummary(),
        analyticsApi.getUsersSummary(),
      ]);

      setDashboard(dashData);
      setPipeline(pipeData);
      setComplaints(compData);
      setExpenses(expData);
      setVisitors(visData);
      setVehicles(vehData);
      setUsers(usrData);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch analytics");
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
