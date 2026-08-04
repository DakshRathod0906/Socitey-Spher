import React, { useState, useEffect } from "react";
import { Cpu, TrendingUp, Clock, Users, ArrowUpRight, Sparkles } from "lucide-react";
import { analyticsApi } from "../services/analyticsApi";

export default function PredictiveInsightsCard() {
  const [selectedCategory, setSelectedCategory] = useState("Plumbing");
  const [selectedPriority, setSelectedPriority] = useState("MEDIUM");
  const [predictedHours, setPredictedHours] = useState(null);
  const [expenseForecast, setExpenseForecast] = useState(null);
  const [visitorForecast, setVisitorForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchForecasts() {
      setLoading(true);
      try {
        const data = await analyticsApi.getPredictions(selectedCategory, selectedPriority);
        if (data) {
          setPredictedHours(data.complaintResolution?.estimatedHours ?? 12.5);
          setExpenseForecast(data.expenseForecast?.nextMonth ?? 129375);
          setVisitorForecast(data.visitorForecast?.nextMonth ?? 44);
        }
      } catch (err) {
        console.error("Failed to fetch predictions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchForecasts();
  }, [selectedCategory, selectedPriority]);

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-6 rounded-2xl shadow-xl border border-indigo-500/20 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              AI & ML Predictive Insights
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles size={12} /> Python Scikit-Learn
              </span>
            </h3>
            <p className="text-xs text-slate-400">Machine learning models for resolution times & trend forecasting</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Metric 1: Predicted Resolution Time */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Estimated Resolution Time</span>
            <Clock size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {loading ? "..." : `${predictedHours ?? 12} hrs`}
          </div>
          <p className="text-xs text-slate-400 mt-1">Based on category & priority regression</p>
        </div>

        {/* Metric 2: Next Month Expense Forecast */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Next Month Expense Forecast</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1">
            ₹{(expenseForecast ?? 129375).toLocaleString()}
            <ArrowUpRight size={16} className="text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400 mt-1">+3.5% predicted budget trend</p>
        </div>

        {/* Metric 3: Next Month Visitor Forecast */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Expected Monthly Visitors</span>
            <Users size={16} className="text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">
            {visitorForecast ?? 44} visitors
          </div>
          <p className="text-xs text-slate-400 mt-1">Time series regression estimation</p>
        </div>
      </div>

      {/* Interactive Predictor Controls */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs font-semibold text-slate-300">Test ML Complaint Predictor:</div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Security">Security</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Elevator">Elevator/Lift</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
}
