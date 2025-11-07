import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback";

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from Google profile
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value || null;
        const name = profile.displayName || null;

        // Use Google ID as openId
        const openId = `google_${googleId}`;

        // Upsert user in database
        await db.upsertUser({
          openId,
          name,
          email,
          loginMethod: "google",
          lastSignedIn: new Date(),
        });

        // Return user info
        done(null, { openId, name, email });
      } catch (error) {
        console.error("[Google OAuth] Error:", error);
        done(error as Error);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.openId);
});

// Deserialize user from session
passport.deserializeUser(async (openId: string, done) => {
  try {
    const user = await db.getUserByOpenId(openId);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export function registerGoogleAuthRoutes(app: Express) {
  // Initialize passport
  app.use(passport.initialize());

  // Google OAuth login route
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
  );

  // Google OAuth callback route
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/" }),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;

        if (!user || !user.openId) {
          res.status(400).json({ error: "Authentication failed" });
          return;
        }

        // Create session token
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        // Redirect to home
        res.redirect(302, "/");
      } catch (error) {
        console.error("[Google OAuth] Callback failed:", error);
        res.status(500).json({ error: "Authentication failed" });
      }
    }
  );

  // Logout route
  app.get("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.redirect(302, "/");
  });
}
