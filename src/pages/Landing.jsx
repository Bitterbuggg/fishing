import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Landing() {
  const q = useQuery();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const campaignId = Number(q.get("c")); // campaign id (bigint)
  const userId = q.get("u");             // user uuid (must equal auth.uid() for insert under current RLS)

  useEffect(() => {
    (async () => {
      setErr("");
      if (!campaignId || !userId) return;

      // Log as "clicked" on arrival (MVP).
      const { error } = await supabase.from("events").insert({
        campaign_id: campaignId,
        user_id: userId,
        type: "clicked",
        metadata: { ua: navigator.userAgent },
      });

      if (error) {
        setErr(error.message);
      } else {
        setSaved(true);
      }
    })();
  }, [campaignId, userId]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">This was a phishing simulation.</h2>
          <p className="opacity-80">
            You clicked a link used for our internal security awareness training.
          </p>

          <div className="divider">Key Tips</div>
          <ul className="list-disc ml-6 space-y-1">
            <li>Check the sender’s email domain and the link URL before clicking.</li>
            <li>Be wary of urgent or threatening language and unexpected attachments.</li>
            <li>Report suspicious emails using your mail client’s report button.</li>
          </ul>

          {saved && (
            <div className="alert alert-success mt-3">
              <span>Your click has been recorded. Keep learning and stay vigilant.</span>
            </div>
          )}
          {err && (
            <div className="alert alert-error mt-3">
              <span>Couldn’t record this event: {err}</span>
            </div>
          )}

          <div className="card-actions justify-end mt-2">
            <a className="btn btn-primary btn-sm" href="/training">Continue to Training</a>
          </div>
        </div>
      </div>
    </div>
  );
}
