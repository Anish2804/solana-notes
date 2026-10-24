"use client";

import { type FC, type CSSProperties, useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Toaster } from "react-hot-toast";

import { useNoteProgram } from "@/hooks/useNoteProgram";
import { UserProfile, NoteWithPubkey } from "@/types/note";
import { CreateUser } from "./CreateUser";
import { CreateNote } from "./CreateNote";
import { NoteList } from "./NoteList";

const drop = (r: string, d: string): CSSProperties =>
  ({ "--r": r, "--d": d }) as CSSProperties;

const DashboardContent: FC = () => {
  const { connected, publicKey } = useWallet();
  const { getUserProfile, getUserNotes } = useNoteProgram();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<NoteWithPubkey[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!connected || !publicKey) {
      setUserProfile(null);
      setNotes([]);
      return;
    }

    setCheckingProfile(true);

    try {
      const profile = await getUserProfile();
      setUserProfile(profile);

      if (profile) {
        setLoading(true);
        const userNotes = await getUserNotes();
        setNotes(userNotes);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setCheckingProfile(false);
      setLoading(false);
    }
  }, [connected, publicKey, getUserProfile, getUserNotes]);

  useEffect(() => {
    void fetchUserData();
  }, [fetchUserData]);

  const handleUserCreated = () => {
    void fetchUserData();
  };
  const handleNoteCreated = () => {
    void fetchUserData();
  };
  const handleRefresh = () => {
    void fetchUserData();
  };

  const key = publicKey?.toString() ?? "";
  const shortKey = key ? `${key.slice(0, 4)}…${key.slice(-4)}` : "";

  return (
    <div className="ink-page">
      <header className="ink-header">
        <div className="ink-wrap">
          <div className="ink-brand">
            <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
              <defs>
                <linearGradient id="inkNote" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fafafb" />
                  <stop offset="1" stopColor="#b6b9c4" />
                </linearGradient>
                <linearGradient id="inkPin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#4b4e58" />
                  <stop offset="1" stopColor="#23252c" />
                </linearGradient>
              </defs>
              <rect x="3" y="5" width="24" height="22" rx="4" fill="url(#inkNote)" stroke="#9c9fa9" />
              <circle cx="15" cy="5" r="4.5" fill="url(#inkPin)" stroke="#f5f5f7" strokeWidth="1.5" />
            </svg>
            Solana Notes
          </div>
          {connected && <WalletMultiButton />}
        </div>
      </header>

      <main className="ink-main">
        <div className="ink-wrap">
          {!connected ? (
            <section className="ink-hero">
              <div>
                <h2>Notes that live on-chain.</h2>
                <p>
                  Connect Phantom, sign once, and your notes are stored on Solana
                  Devnet. Only your wallet can change them.
                </p>
                <WalletMultiButton />
              </div>

              <div className="ink-stack" aria-hidden="true">
                <div className="sticky sticky-drop s1" style={drop("-4deg", "0.1s")}>
                  Your wallet signs every change.
                </div>
                <div className="sticky sticky-drop s2" style={drop("3deg", "0.3s")}>
                  Stored on Solana Devnet.
                </div>
                <div className="sticky sticky-drop s3" style={drop("-2deg", "0.5s")}>
                  Edit or delete whenever you like.
                </div>
              </div>
            </section>
          ) : checkingProfile ? (
            <div className="ink-loading" role="status">
              <div className="ink-dots">
                <span />
                <span />
                <span />
              </div>
              <p>Loading your profile…</p>
            </div>
          ) : !userProfile ? (
            <CreateUser onUserCreated={handleUserCreated} />
          ) : (
            <>
              <section className="ink-welcome">
                <div>
                  <h2>Hi, {userProfile.username}</h2>
                  <span className="ink-pill">{shortKey}</span>
                </div>
                <div className="ink-count">
                  <strong>{notes.length}</strong>
                  {notes.length === 1 ? "note" : "notes"}
                </div>
              </section>

              <div className="ink-slot">
                <CreateNote onNoteCreated={handleNoteCreated} />
              </div>

              <NoteList notes={notes} onRefresh={handleRefresh} loading={loading} />
            </>
          )}
        </div>
      </main>

      <footer className="ink-footer">
        <div className="ink-wrap">
          Running on Solana Devnet. Program <code>CmGDsQ…X5Aji</code>
        </div>
      </footer>
    </div>
  );
};

export const Dashboard: FC = () => (
  <>
    <DashboardContent />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#f5f4f8",
          color: "#1b1530",
          border: "1.5px solid #d2d3d9",
          borderRadius: "14px",
        },
        success: { iconTheme: { primary: "#23252c", secondary: "#f5f5f7" } },
        error: { iconTheme: { primary: "#b3261e", secondary: "#f5f5f7" } },
      }}
    />
  </>
);