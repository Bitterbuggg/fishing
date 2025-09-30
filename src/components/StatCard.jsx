export default function StatCard({ title, value, sub }) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p className="text-4xl font-bold">{value}</p>
        {sub && <p className="text-sm opacity-70">{sub}</p>}
      </div>
    </div>
  );
}
