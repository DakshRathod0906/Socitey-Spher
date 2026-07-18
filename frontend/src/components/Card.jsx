const Card = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${className}`}>
    {title && <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">{title}</h3>}
    {children}
  </div>
);

export default Card;
