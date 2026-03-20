import express from "express";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

// Load Firebase config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));

try {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);

let botServerUrl = "http://172.232.226.13:2413"; // Default fallback

// Listen for dynamic bot server URL changes from Firestore
db.collection("settings").doc("botServer").onSnapshot((doc) => {
  if (doc.exists) {
    const data = doc.data();
    if (data && data.url) {
      botServerUrl = data.url;
      console.log("Bot server URL updated to:", botServerUrl);
    }
  }
}, (err) => {
  console.error("Error listening to botServer settings:", err);
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to verify Firebase Auth token
  const verifyAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      (req as any).user = decodedToken;
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };

  // API Route for pairing
  app.post("/api/pairing", express.json(), verifyAuth, async (req, res) => {
    const user = (req as any).user;
    
    try {
      const userRef = db.collection("users").doc(user.uid);
      const docSnap = await userRef.get();
      
      if (!docSnap.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = docSnap.data();
      if (!userData || userData.limit <= 0) {
        return res.status(403).json({ error: "Daily limit reached" });
      }

      // Decrement limit
      await userRef.update({ limit: FieldValue.increment(-1) });

      // Forward request to external server
      const targetUrl = `${botServerUrl}/api/pairing`;
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Pairing request failed:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route for pairing status
  app.get("/api/pairing/status/:num", verifyAuth, async (req, res) => {
    try {
      const { num } = req.params;
      const targetUrl = `${botServerUrl}/api/pairing/status/${num}`;
      const response = await fetch(targetUrl);
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Pairing status request failed:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Proxy other /api requests
  app.use(
    "/api",
    verifyAuth,
    createProxyMiddleware({
      target: "http://172.232.226.13:2413", // Fallback target
      router: () => botServerUrl, // Dynamically route to current botServerUrl
      changeOrigin: true,
      secure: false,
      on: {
        error: (err, req, res: any) => {
          console.error("Proxy error:", err);
          res.status(502).json({ error: "Bad Gateway: Proxy failed" });
        },
      },
    })
  );

  // Catch-all for /api that didn't match anything
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.path}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
