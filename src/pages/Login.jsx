import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  async function onLogin() {
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setErr(error.message);
    else nav("/dashboard");
  }

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="card w-full max-w-sm bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Admin Login</h2>
          <input className="input input-bordered" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input input-bordered" placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
          {err && <p className="text-error text-sm">{err}</p>}
          <button className="btn btn-primary" onClick={onLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}
