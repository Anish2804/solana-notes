import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export interface UserProfile {
  authority: PublicKey;
  username: string;
  noteCount: BN;
}

export interface Note {
  authority: PublicKey;
  id: BN;
  title: string;
  content: string;
}

export interface NoteWithPubkey extends Note {
  publicKey: PublicKey;
}
