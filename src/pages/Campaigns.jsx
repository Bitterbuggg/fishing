import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(3, "Name is required"),
  type: z.enum(["fake_login","spear_phishing","smishing"]),
  scheduleAt: z.string().optional(),
  audience: z.string().min(1, "Audience is required"),
});

export default function Campaigns() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: "fake_login" },
  });

  function onSubmit(values) {
    console.log("Create campaign (mock):", values);
    // later: call presenter to create + schedule
    reset();
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>New Campaign</button>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th><th>Type</th><th>Status</th>
                  <th>Sent</th><th>Opened</th><th>Clicked</th><th>Reported</th><th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="opacity-60">No campaigns yet</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-xl">
            <h3 className="font-bold text-lg mb-2">New Campaign</h3>
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="form-control">
                <label className="label"><span className="label-text">Name</span></label>
                <input className="input input-bordered" placeholder="October Phish Test"
                       {...register("name")} />
                {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text">Type</span></label>
                  <select className="select select-bordered" {...register("type")}>
                    <option value="fake_login">Fake Login (email)</option>
                    <option value="spear_phishing">Spear Phishing</option>
                    <option value="smishing">Smishing (SMS)</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Schedule (optional)</span></label>
                  <input type="datetime-local" className="input input-bordered" {...register("scheduleAt")} />
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Audience</span></label>
                <input className="input input-bordered" placeholder="All employees / Dept: Sales"
                       {...register("audience")} />
                {errors.audience && <p className="text-error text-sm mt-1">{errors.audience.message}</p>}
              </div>

              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onSubmit={() => setOpen(false)}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
