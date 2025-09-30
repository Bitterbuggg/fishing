import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../lib/supabaseClient";

export default function Users() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  // 👉 added state for table rows + loading
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👉 fetch profiles on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name,email,role,risk_score,departments:department_id(name)"
        )
        .limit(100);

      if (mounted) {
        if (error) {
          console.error("profiles fetch error:", error);
          setRows([]);
        } else {
          setRows(data || []);
        }
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function onSubmit(v) {
    console.log("Create user (mock):", v);
    reset();
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex items-center gap-2">
          <div className="join">
            <input
              className="input input-bordered join-item"
              placeholder="Search user..."
            />
            <button className="btn join-item">Search</button>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setOpen(true)}
          >
            Add User
          </button>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Risk</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="opacity-60">
                      Loading…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="opacity-60">
                      No users yet
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.full_name || "—"}</td>
                      <td>{r.email}</td>
                      <td>{r.departments?.name || "—"}</td>
                      <td>{r.risk_score ?? 0}</td>
                      <td>
                        <button className="btn btn-xs">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <div className={`drawer drawer-end ${open ? "drawer-open" : ""}`}>
        <input
          id="user-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={open}
          readOnly
        />
        <div className="drawer-content"></div>
        <div className="drawer-side z-30">
          <label
            htmlFor="user-drawer"
            className="drawer-overlay"
            onClick={() => setOpen(false)}
          ></label>
          <div className="menu p-4 w-96 min-h-full bg-base-100 border-l">
            <h3 className="font-bold text-lg mb-3">Add User</h3>
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <input
                className="input input-bordered w-full"
                placeholder="Full name"
                {...register("name")}
              />
              <input
                className="input input-bordered w-full"
                placeholder="Email"
                type="email"
                {...register("email")}
              />
              <input
                className="input input-bordered w-full"
                placeholder="Department"
                {...register("department")}
              />
              <select className="select select-bordered w-full" {...register("role")}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
