"use client";

import { type FC, type ReactNode, type ComponentType, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { NETWORK } from "@/utils/constants";

import "@solana/wallet-adapter-react-ui/styles.css";

// React type compatibility wrapper for ConnectionProvider
const ConnectionProviderCompat =
  ConnectionProvider as unknown as ComponentType<{
    endpoint: string;
    children: ReactNode;
  }>;

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Phantom etc. are auto-detected via Wallet Standard, so no explicit adapters needed
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProviderCompat endpoint={NETWORK}>
      <WalletProvider
        wallets={wallets}
        autoConnect={false}
        onError={(e) => {
          if (e.name === "WalletConnectionError") {
            console.warn("Wallet connect failed:", e.message);
            return;
          }
          console.error(e);
        }}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProviderCompat>
  );
};