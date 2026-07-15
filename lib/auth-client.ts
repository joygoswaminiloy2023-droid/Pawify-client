"use client";

import { useState, useEffect } from "react";
import { createAuthClient } from "better-auth/react";
import { jwtClient, inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Changed: was NEXT_PUBLIC_API_URL (the Express server) — auth now lives
  // in this Next.js app, so it points at itself. Same-origin, so cookies
  // and CORS become much simpler for anything auth-related.
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    jwtClient(),
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false },
        status: { type: "string", required: false },
      },
    }),
  ],
});

export const useSession = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setSession(data);
      setLoading(false);
    });
  }, []);

  return { data: session, isPending: loading };
};