import { LineChartCard, AreaChartCard, BarChartCard } from "../components/ChartCard.jsx";

const clickTrend = [
  { label: "Jan", value: 1 }, { label: "Feb", value: 3 }, { label: "Mar", value: 2 },
  { label: "Apr", value: 4 }, { label: "May", value: 3 }, { label: "Jun", value: 5 },
];

const reportTrend = [
  { label: "Jan", value: 0 }, { label: "Feb", value: 1 }, { label: "Mar", value: 2 },
  { label: "Apr", value: 3 }, { label: "May", value: 4 }, { label: "Jun", value: 5 },
];

const heatmapLike = [
  { label: "Eng", value: 3 }, { label: "Sales", value: 5 }, { label: "Ops", value: 2 }, { label: "HR", value: 1 },
];

export default function Analytics() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <LineChartCard title="Click Rate (monthly)" data={clickTrend} />
        <AreaChartCard title="Report Rate (monthly)" data={reportTrend} />
        <BarChartCard title="Incidents by Department" data={heatmapLike} />
      </div>
    </div>
  );
}
