import React from "react";
import { Activity, Clock, Database, CheckCircle, AlertCircle, Cpu } from "lucide-react";

const PipelineStatus = ({ pipeline, onTrainML, isTraining }) => {
  if (!pipeline) return null;

  const isSuccess = pipeline.status === "SUCCESS";
  const statusColor = isSuccess ? "text-emerald-500" : "text-red-500";
  const StatusIcon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          ML Pipeline Status
        </h2>
        <div className="flex items-center gap-3">
          {onTrainML && (
            <button
              onClick={onTrainML}
              disabled={isTraining}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Cpu className={`w-3.5 h-3.5 ${isTraining ? "animate-spin" : ""}`} />
              <span>{isTraining ? "Training Models..." : "Train ML Models"}</span>
            </button>
          )}
          <div className={`flex items-center gap-1.5 font-medium px-3 py-1 rounded-full bg-gray-50 ${statusColor}`}>
            <StatusIcon className="w-4 h-4" />
            <span>{pipeline.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Last Run</p>
            <p className="text-gray-900 font-semibold">
              {pipeline.lastRun !== "Unknown" 
                ? new Date(pipeline.lastRun).toLocaleString()
                : "Never run"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Duration</p>
            <p className="text-gray-900 font-semibold">{pipeline.duration}s</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Database className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Records Processed</p>
            <p className="text-gray-900 font-semibold">{pipeline.recordsProcessed}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineStatus;
