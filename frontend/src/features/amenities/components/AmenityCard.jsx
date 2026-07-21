import { Card } from "../../../components/ui";
import { Clock, Users } from "lucide-react";

export default function AmenityCard({ amenity, onBookClick }) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-slate-800">{amenity.name}</h3>
          {!amenity.isActive && (
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
              Maintenance
            </span>
          )}
        </div>
        
        <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-1">
          {amenity.description || "No description provided."}
        </p>

        <div className="space-y-2 mt-auto border-t border-slate-100 pt-4">
          <div className="flex items-center text-sm text-slate-600">
            <Clock className="w-4 h-4 mr-2 text-slate-400" />
            <span>{amenity.openTime} - {amenity.closeTime}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Users className="w-4 h-4 mr-2 text-slate-400" />
            <span>Capacity: {amenity.capacity} concurrent</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <button
          onClick={() => onBookClick(amenity)}
          disabled={!amenity.isActive}
          className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {amenity.isActive ? "Book Now" : "Currently Unavailable"}
        </button>
      </div>
    </Card>
  );
}
