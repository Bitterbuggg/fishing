import { useState } from "react";

export default function Training() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Training & Quizzes</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Module: Recognizing Phishing</h2>
            <p className="opacity-70">0% complete</p>
            <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>Start</button>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Quiz: Spot the Red Flags</h2>
            <p className="opacity-70">0 attempts</p>
            <button className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>Take Quiz</button>
          </div>
        </div>
      </div>

      {open && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-2">Quiz: Spot the Red Flags</h3>
            <div className="space-y-3">
              <p className="opacity-80">Q1. Which is a common sign of phishing?</p>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer"><input type="radio" name="q1" className="radio mr-2" />Urgent pressure</label>
                <label className="cursor-pointer"><input type="radio" name="q1" className="radio mr-2" />Correct domain</label>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => setOpen(false)}>Submit</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onSubmit={() => setOpen(false)}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
