"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  AnchorProvider,
  BN,
  Program,
} from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useCallback, useMemo } from "react";

import type { NoteApp } from "@/utils/note_app";
import { IDL } from "@/utils/idl";

import {
  PROGRAM_ID,
  USER_PROFILE_SEED,
  NOTE_SEED,
} from "@/utils/constants";

import type {
  UserProfile,
  Note,
  NoteWithPubkey,
} from "@/types/note";

export const useNoteProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Create Anchor provider only when the wallet can sign transactions.
  const provider = useMemo(() => {
    if (
      !wallet.publicKey ||
      !wallet.signTransaction ||
      !wallet.signAllTransactions
    ) {
      return null;
    }

    const anchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction.bind(wallet),
      signAllTransactions: wallet.signAllTransactions.bind(wallet),
    };

    return new AnchorProvider(
      connection,
      anchorWallet,
      AnchorProvider.defaultOptions()
    );
  }, [
    connection,
    wallet.publicKey,
    wallet.signTransaction,
    wallet.signAllTransactions,
  ]);

  // Use the real IDL with the generated TypeScript type.
  const program = useMemo(() => {
    if (!provider) return null;

    try {
      return new Program<NoteApp>(
        IDL as unknown as NoteApp,
        provider
      );
    } catch (error) {
      console.error("Error creating Anchor program:", error);
      return null;
    }
  }, [provider]);

  // Derive the user's profile PDA.
  const getUserProfilePDA = useCallback(
    (userPubkey: PublicKey) => {
      return PublicKey.findProgramAddressSync(
        [
          Buffer.from(USER_PROFILE_SEED),
          userPubkey.toBuffer(),
        ],
        PROGRAM_ID
      );
    },
    []
  );

  // Derive a note PDA.
  const getNotePDA = useCallback(
    (userPubkey: PublicKey, noteId: number) => {
      const noteIdBuffer = Buffer.alloc(8);
      noteIdBuffer.writeBigUInt64LE(BigInt(noteId));

      return PublicKey.findProgramAddressSync(
        [
          Buffer.from(NOTE_SEED),
          userPubkey.toBuffer(),
          noteIdBuffer,
        ],
        PROGRAM_ID
      );
    },
    []
  );

  // Create a user profile.
  const createUser = useCallback(
    async (username: string): Promise<string> => {
      if (!program || !wallet.publicKey) {
        throw new Error("Connect a signing wallet first.");
      }

      const [userProfilePDA] =
        getUserProfilePDA(wallet.publicKey);

      return program.methods
        .createUser(username)
        .accountsPartial({
          userProfile: userProfilePDA,
          signer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    [program, wallet.publicKey, getUserProfilePDA]
  );

  // Fetch the connected user's profile.
  const getUserProfile =
    useCallback(async (): Promise<UserProfile | null> => {
      if (!program || !wallet.publicKey) return null;

      try {
        const [userProfilePDA] =
          getUserProfilePDA(wallet.publicKey);

        const profile =
          await program.account.userProfile.fetch(userProfilePDA);

        return profile as UserProfile;
      } catch (error) {
        console.log("Could not fetch user profile:", error);
        return null;
      }
    }, [program, wallet.publicKey, getUserProfilePDA]);

  // Create a note.
  const createNote = useCallback(
    async (
      title: string,
      content: string
    ): Promise<string> => {
      if (!program || !wallet.publicKey) {
        throw new Error("Connect a signing wallet first.");
      }

      const [userProfilePDA] =
        getUserProfilePDA(wallet.publicKey);

      const userProfile =
        await program.account.userProfile.fetch(userProfilePDA);

      const nextNoteId =
        (userProfile.noteCount as BN).toNumber() + 1;

      const [notePDA] =
        getNotePDA(wallet.publicKey, nextNoteId);

      return program.methods
        .createNote(title, content)
        .accountsPartial({
          userProfile: userProfilePDA,
          note: notePDA,
          signer: wallet.publicKey,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    [program, wallet.publicKey, getUserProfilePDA, getNotePDA]
  );

  // Fetch all notes for the connected user.
  const getUserNotes =
    useCallback(async (): Promise<NoteWithPubkey[]> => {
      if (!program || !wallet.publicKey) return [];

      try {
        const [userProfilePDA] =
          getUserProfilePDA(wallet.publicKey);

        const userProfile =
          await program.account.userProfile.fetch(userProfilePDA);

        const noteCount =
          (userProfile.noteCount as BN).toNumber();

        const notes: NoteWithPubkey[] = [];

        for (let i = 1; i <= noteCount; i++) {
          try {
            const [notePDA] =
              getNotePDA(wallet.publicKey, i);

            const note =
              await program.account.note.fetch(notePDA);

            notes.push({
              ...(note as Note),
              publicKey: notePDA,
            });
          } catch (error) {
            console.log(`Note ${i} could not be fetched:`, error);
          }
        }

        return notes;
      } catch (error) {
        console.error("Error fetching notes:", error);
        return [];
      }
    }, [program, wallet.publicKey, getUserProfilePDA, getNotePDA]);

  // Update an existing note.
  const updateNote = useCallback(
    async (
      noteId: number,
      newContent: string
    ): Promise<string> => {
      if (!program || !wallet.publicKey) {
        throw new Error("Connect a signing wallet first.");
      }

      const [notePDA] =
        getNotePDA(wallet.publicKey, noteId);

      return program.methods
        .updateNote(new BN(noteId), newContent)
        .accountsPartial({
          note: notePDA,
          signer: wallet.publicKey,
          authority: wallet.publicKey,
        })
        .rpc();
    },
    [program, wallet.publicKey, getNotePDA]
  );

  // Delete a note.
  const deleteNote = useCallback(
    async (noteId: number): Promise<string> => {
      if (!program || !wallet.publicKey) {
        throw new Error("Connect a signing wallet first.");
      }

      const [notePDA] =
        getNotePDA(wallet.publicKey, noteId);

      return program.methods
        .deleteNote(new BN(noteId))
        .accountsPartial({
          note: notePDA,
          signer: wallet.publicKey,
          authority: wallet.publicKey,
        })
        .rpc();
    },
    [program, wallet.publicKey, getNotePDA]
  );

  return {
    program,
    createUser,
    getUserProfile,
    createNote,
    getUserNotes,
    updateNote,
    deleteNote,
    connected: wallet.connected,
    publicKey: wallet.publicKey,
  };
};
