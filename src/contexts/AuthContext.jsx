import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(user) {
    if (!user) { 
      setProfile(null);
      return; 
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (!error) setProfile(data);
  }

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      loadProfile(data.session?.user ?? null).finally(() => setLoading(false));
    });

    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
      if (!sess?.user) {
        setProfile(null);        // 🔥 clear profile when logged out
      } else {
        loadProfile(sess.user);  // reload profile when logged in
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = { session, user: session?.user ?? null, profile, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
