export default function Reports() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="grid md:grid-cols-4 gap-3">
            <input className="input input-bordered" type="date" placeholder="From" />
            <input className="input input-bordered" type="date" placeholder="To" />
            <input className="input input-bordered" placeholder="Campaign name" />
            <input className="input input-bordered" placeholder="Department" />
          </div>
          <div className="flex gap-2 mt-3">
            <button className="btn btn-primary btn-sm">Apply Filters</button>
            <button className="btn btn-outline btn-sm">Export CSV</button>
            <button className="btn btn-outline btn-sm">Export PDF</button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th><th>Campaign</th><th>Opened</th><th>Clicked</th><th>Reported</th><th>Downloaded</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={6} className="opacity-60">No results yet</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
