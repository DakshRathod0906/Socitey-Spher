import { Link } from "react-router-dom";

const DashboardCard = ({ title, count, icon, action, link, color = "brand" }) => {
  const colorStyles = {
    brand: "bg-brand-50 text-brand-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    slate: "bg-slate-50 text-slate-700",
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          {icon || <span className="text-xl">📊</span>}
        </div>
        {count !== undefined && (
          <h3 className="text-3xl font-bold text-slate-800">{count}</h3>
        )}
      </div>
      <div>
        <h4 className="text-slate-500 font-medium mb-4">{title}</h4>
        {link ? (
          <Link to={link} className="text-sm font-medium text-brand-600 hover:text-brand-700">
            {action} &rarr;
          </Link>
        ) : (
          <button className="text-sm font-medium text-brand-600 hover:text-brand-700">
            {action} &rarr;
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
