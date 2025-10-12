import { createAuthClient } from "better-auth/react";
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  deleteUser,
  updateUser,
  changePassword,
  forgetPassword,
  verifyEmail,
  getSession
} = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL,
});
