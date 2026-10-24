import { PublicKey, clusterApiUrl } from "@solana/web3.js";

// Your deployed program ID from declare_id!
export const PROGRAM_ID = new PublicKey(
  "6LwYsQzk9eaRQNPeWfXLYaJTEKcTJ1SPMr77paPdrgGQ"
);

// Network configuration
export const NETWORK = clusterApiUrl("devnet");

// Seeds for PDA derivation (must match your Anchor program)
export const USER_PROFILE_SEED = "user_profile";
export const NOTE_SEED = "note";

// Account size limits (from your Anchor program)
export const MAX_USERNAME_LENGTH = 50;
export const MAX_TITLE_LENGTH = 100;
export const MAX_CONTENT_LENGTH = 500;
