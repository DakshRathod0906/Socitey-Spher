import { Input, Select } from "../../../components/ui";
import { Search } from "lucide-react";

export default function StaffFilters({ filters, onFilterChange }) {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search by name, email, or employee ID..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          icon={Search}
        />
      </div>
      
      <div className="flex gap-4 flex-wrap md:flex-nowrap">
        <Select 
          className="w-full md:w-36" 
          value={filters.role} 
          onChange={(e) => handleChange("role", e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="security">Security</option>
          <option value="service_staff">Service Staff</option>
        </Select>

        <Select 
          className="w-full md:w-36" 
          value={filters.status} 
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
        
        {filters.role === "service_staff" && (
          <Select 
            className="w-full md:w-40" 
            value={filters.department} 
            onChange={(e) => handleChange("department", e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="electrician">Electrician</option>
            <option value="plumber">Plumber</option>
            <option value="carpenter">Carpenter</option>
            <option value="gardener">Gardener</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="lift_technician">Lift Tech</option>
            <option value="other">Other</option>
          </Select>
        )}
        
        {filters.role === "security" && (
          <Select 
            className="w-full md:w-36" 
            value={filters.shift} 
            onChange={(e) => handleChange("shift", e.target.value)}
          >
            <option value="">All Shifts</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </Select>
        )}
      </div>
    </div>
  );
}
