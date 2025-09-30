import StatCard from "../components/StatCard.jsx";
import { LineChartCard, AreaChartCard } from "../components/ChartCard.jsx";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const clicksTrend = [
  { label: "W1", value: 2 }, { label: "W2", value: 4 },
  { label: "W3", value: 3 }, { label: "W4", value: 5 },
];

const reportsTrend = [
  { label: "W1", value: 1 }, { label: "W2", value: 2 },
  { label: "W3", value: 4 }, { label: "W4", value: 6 },
];

export default function Dashboard() {
  const [testedCount, setTestedCount] = useState(0);
  const [clickRate, setClickRate] = useState("0%");
  const [reportRate, setReportRate] = useState("0%");

  useEffect(() => {
    (async () => {
      // employees tested = distinct recipients
      const { data: rec } = await supabase
        .from("campaign_recipients")
        .select("user_id", { count: "exact", head: true });
      setTestedCount(rec ? rec.length : 0);

      // click rate = clicked / sent (simple MVP)
      const { count: clicks } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("type", "clicked");
      const { count: sent } = await supabase
        .from("campaign_recipients")
        .select("*", { count: "exact", head: true })
        .not("sent_at", "is", null);
      const cr = sent ? Math.round(((clicks || 0) / sent) * 100) : 0;
      setClickRate(`${cr}%`);

      // report rate
      const { count: reports } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("type", "reported");
      const rr = sent ? Math.round(((reports || 0) / sent) * 100) : 0;
      setReportRate(`${rr}%`);
    })();
  }, []);

  return (
    <div className="space-y-6">
       <div className="grid gap-4 lg:gap-6 md:grid-cols-3">
        <StatCard title="Employees Tested" value={testedCount} sub="Total across all campaigns" />
        <StatCard title="Phish Click Rate" value={clickRate} sub="All time (MVP)" />
        <StatCard title="Report Rate" value={reportRate} sub="All time (MVP)" />
      </div>

      <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
        <LineChartCard title="Click Rate (weekly)" data={clicksTrend} />
        <AreaChartCard title="Report Rate (weekly)" data={reportsTrend} />
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr><th>Time</th><th>User</th><th>Action</th><th>Campaign</th></tr>
              </thead>
              <tbody>
                <tr><td>—</td><td>—</td><td>No data yet</td><td>—</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
