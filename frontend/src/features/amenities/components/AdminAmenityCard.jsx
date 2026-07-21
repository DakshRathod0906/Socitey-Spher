import { Card } from "../../../components/ui";
import { Clock, Users, Edit, Power, PowerOff } from "lucide-react";

export default function AdminAmenityCard({ amenity, onEditClick, onToggleStatus, isToggling }) {
  return (
    <Card className={`flex flex-col h-full transition-shadow ${!amenity.isActive ? 'bg-slate-50 opacity-80' : 'hover:shadow-md'}`}>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-slate-800">{amenity.name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${amenity.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {amenity.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-1">
          {amenity.description || "No description provided."}
        </p>

        <div className="space-y-2 mt-auto border-t border-slate-100 pt-4">
          <div className="flex items-center text-sm text-slate-600">
            <Clock className="w-4 h-4 mr-2 text-slate-400" />
            <span>{amenity.openTime} - {amenity.closeTime} ({amenity.slotDurationMinutes}m slots)</span>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Users className="w-4 h-4 mr-2 text-slate-400" />
            <span>Capacity: {amenity.capacity} concurrent</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
        <button
          onClick={() => onEditClick(amenity)}
          className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors flex justify-center items-center"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </button>
        <button
          onClick={() => onToggleStatus(amenity)}
          disabled={isToggling}
          className={`flex-1 py-2 border rounded-md text-sm font-medium transition-colors flex justify-center items-center ${
            amenity.isActive 
              ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
              : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
          }`}
        >
          {amenity.isActive ? <PowerOff className="w-4 h-4 mr-2" /> : <Power className="w-4 h-4 mr-2" />}
          {amenity.isActive ? 'Disable' : 'Enable'}
        </button>
      </div>
    </Card>
  );
}
