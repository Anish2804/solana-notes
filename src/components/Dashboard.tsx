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

const anim = (vars: Record<string, string>): CSSProperties => vars as CSSProperties;

const Logo: FC = () => (
  <svg width="32" height="32" viewBox="0 0 30 30" aria-hidden="true">
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
);

const DashboardContent: FC = () => {
  const { connected, publicKey, disconnect } = useWallet();
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

  /* ---------- split-screen: connect / checking / create profile ---------- */
  if (!connected || checkingProfile || !userProfile) {
    return (
      <div className="ink-page ink-auth">
        <div className="ink-photo" aria-hidden="true" />
        <section className="ink-auth-left">
          <div className="ink-auth-inner">
            <div className="ink-auth-brand ink-rise">
              <Logo />
              Solana Notes
            </div>

            {!connected ? (
              <>
                <h1 className="ink-rise" style={anim({ "--d": "0.08s" })}>
                  Sign in with your wallet
                </h1>
                <p className="ink-auth-sub ink-rise" style={anim({ "--d": "0.16s" })}>
                  No password, no email. Your Phantom wallet is your login, and every
                  note you pin is stored on Solana Devnet.
                </p>
                <div className="ink-rise" style={anim({ "--d": "0.24s" })}>
                  <WalletMultiButton />
                </div>
                <ol className="ink-steps ink-rise" style={anim({ "--d": "0.32s" })}>
                  <li>
                    <b>1</b>
                    <span>
                      <strong>Connect Phantom</strong>
                      Switch it to Solana Devnet first.
                    </span>
                  </li>
                  <li>
                    <b>2</b>
                    <span>
                      <strong>Pick a username</strong>
                      Saved once, next to your wallet.
                    </span>
                  </li>
                  <li>
                    <b>3</b>
                    <span>
                      <strong>Pin your notes</strong>
                      Edit or delete them any time.
                    </span>
                  </li>
                </ol>
                <p className="ink-auth-links ink-rise" style={anim({ "--d": "0.4s" })}>
                  <a href="https://phantom.com" target="_blank" rel="noopener noreferrer">
                    Get Phantom
                  </a>
                  <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer">
                    Free Devnet SOL
                  </a>
                </p>
              </>
            ) : checkingProfile ? (
              <div className="ink-loading ink-rise" role="status" style={{ padding: "40px 0", color: "#a9acb8" }}>
                <div className="ink-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <p>Checking your wallet…</p>
              </div>
            ) : (
              <>
                <h1 className="ink-rise" style={anim({ "--d": "0.08s" })}>
                  Create your profile
                </h1>
                <p className="ink-auth-sub ink-rise" style={anim({ "--d": "0.16s" })}>
                  Pick a username. It is saved on-chain next to your wallet, so you only
                  do this once.
                </p>
                <span className="ink-auth-pill ink-rise" style={anim({ "--d": "0.2s" })}>
                  {shortKey}
                </span>
                <div className="ink-rise" style={anim({ "--d": "0.26s" })}>
                  <CreateUser onUserCreated={handleUserCreated} />
                </div>
                <button
                  type="button"
                  className="ink-auth-switch ink-rise"
                  style={anim({ "--d": "0.34s" })}
                  onClick={() => void disconnect()}
                >
                  Use a different wallet
                </button>
              </>
            )}
          </div>
        </section>

        <section className="ink-auth-right" aria-hidden="true">
          <div className="ink-board">
            <div className="sticky sticky-drop n1" style={anim({ "--r": "-4deg", "--d": "0.15s" })}>
              <small>Day 01</small>
              Finally working.
            </div>
            <div className="sticky sticky-drop n2" style={anim({ "--r": "3deg", "--d": "0.35s" })}>
              <small>Login</small>
              Your wallet is your password.
            </div>
            <div className="sticky sticky-drop n3" style={anim({ "--r": "-2deg", "--d": "0.55s" })}>
              <small>Storage</small>
              Lives on Solana Devnet.
            </div>
            <div className="sticky sticky-drop n4" style={anim({ "--r": "4deg", "--d": "0.75s" })}>
              <small>Control</small>
              Edit or delete any time.
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ---------- signed-in dashboard ---------- */
  return (
    <div className="ink-page">
      <header className="ink-header">
        <div className="ink-wrap">
          <div className="ink-brand">
            <Logo />
            Solana Notes
          </div>
          <WalletMultiButton />
        </div>
      </header>

      <main className="ink-main">
        <div className="ink-wrap">
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
        </div>
      </main>

      <footer className="ink-footer">
        <div className="ink-wrap">
          Running on Solana Devnet. Program <code>6LwYsQ…rdgGQ</code>
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