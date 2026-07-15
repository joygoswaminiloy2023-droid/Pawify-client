"use client";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsPending(true);
        console.log("🔍 Fetching session...");

        const { data, error } = await authClient.getSession();

        if (error) {
          console.error("❌ Session error:", error);
          setSession(null);
          localStorage.removeItem("bearer_token");
          localStorage.removeItem("user");
          return;
        }

        if (data) {
          console.log("✅ Session found:", data.user?.email);
          setSession(data);

          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));

            // Fetch the actual signed JWT (from the jwt() plugin) — this is
            // what Express verifies via JWKS. The old code stored
            // data.session?.id here, which is just the raw session ID and
            // was never a valid JWT, so Express always rejected it.
            try {
              const { data: tokenData } = await authClient.token();
              if (tokenData?.token) {
                localStorage.setItem("bearer_token", tokenData.token);
              } else {
                console.warn("⚠️ No token returned from authClient.token()");
                localStorage.removeItem("bearer_token");
              }
            } catch (tokenError) {
              console.error("❌ Failed to fetch bearer token:", tokenError);
              localStorage.removeItem("bearer_token");
            }
          }
        } else {
          console.log("ℹ️ No session found");
          setSession(null);
          localStorage.removeItem("bearer_token");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("❌ Session fetch error:", error);
        setSession(null);
        localStorage.removeItem("bearer_token");
        localStorage.removeItem("user");
      } finally {
        setIsPending(false);
        setTokenReady(true);
      }
    };

    fetchSession();
  }, []);

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("bearer_token");
    localStorage.removeItem("user");
    setSession(null);
    window.location.href = "/login";
  };

  return {
    user: session?.user ?? null,
    loading: isPending || !tokenReady,
    logout,
  };
}