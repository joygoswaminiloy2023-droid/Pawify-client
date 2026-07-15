import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let authInstance: any = null;

async function connectToDatabase(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.DB_NAME || "pawify");

  cachedClient = client;
  cachedDb = db;

  console.log(`Connected to MongoDB (database: ${db.databaseName})`);
  return db;
}

export async function getAuth() {
  if (authInstance) return authInstance;

  try {
    const db = await connectToDatabase();

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    const requiredCollections = ["user", "account", "session", "verification", "jwks"];
    for (const coll of requiredCollections) {
      if (!collectionNames.includes(coll)) {
        console.log(`Creating '${coll}' collection...`);
        await db.createCollection(coll);
      }
    }

    const baseURL =
      process.env.BETTER_AUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    authInstance = betterAuth({
      secret: process.env.BETTER_AUTH_SECRET!,
      baseURL,
      emailAndPassword: {
        enabled: true,
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          scope: ["email", "profile"],
        },
      },
      user: {
        additionalFields: {
          role: {
            type: "string",
            defaultValue: "user",
            input: false,
          },
          status: {
            type: "string",
            defaultValue: "active",
            input: false,
          },
        },
      },
      trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:5000",
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.NEXT_PUBLIC_API_URL, // your Express server, so its requests aren't blocked
        ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
      ].filter(Boolean) as string[],
      account: {
        accountLinking: {
          enabled: true,
          trustedProviders: ["google"],
        },
      },
      database: mongodbAdapter(db),
      // Cookie attributes: removed the previous sameSite:"none"+secure:true
      // override. That was only needed when the Express server and Next.js
      // client lived on separate domains and had to share cross-site
      // cookies. Now that Better Auth runs inside this Next.js app, the
      // session cookie is same-origin — Better Auth's defaults (Lax,
      // Secure automatically in production over HTTPS) just work, and
      // won't get silently dropped on http://localhost.
      // ── JWT plugin: this is what makes cross-origin Express verification
      // possible. It exposes /api/auth/jwks (public keys) and /api/auth/token
      // (issues a JWT for the current session) from THIS Next.js app.
      plugins: [
        jwt({
          jwt: {
            // Custom claims — Express reads these directly off the verified
            // JWT payload, so role/status/email must be embedded here.
            definePayload: ({ user }) => ({
              id: user.id,
              email: user.email,
              role: (user as any).role,
              status: (user as any).status,
            }),
          },
        }),
      ],
    });

    console.log("Auth initialized successfully (Next.js host)");
    return authInstance;
  } catch (error) {
    console.error("Failed to initialize auth:", error);
    throw error;
  }
}