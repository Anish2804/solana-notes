# Solana Note App Frontend

A Next.js frontend for your Solana Note App deployed on Devnet.

## Features

- 🔐 Wallet connection (Phantom, Solflare, etc.)
- 👤 Create user profiles stored on-chain
- 📝 Create, read, update, and delete notes
- 💾 All data stored on Solana Devnet
- 🎨 Modern dark theme UI with Tailwind CSS

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Solana Wallet** (Phantom recommended)
3. **Devnet SOL** for transaction fees

### Getting Devnet SOL

```bash
# Using Solana CLI
solana airdrop 2 --url devnet

# Or use the Solana Faucet website
# https://faucet.solana.com/
```

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Update the IDL (Important!):**

Replace the IDL in `src/utils/idl.ts` with your actual IDL from:
```
your-anchor-project/target/idl/note_app.json
```

The IDL file is generated when you build your Anchor program with `anchor build`.

3. **Verify Program ID:**

Make sure the `PROGRAM_ID` in `src/utils/constants.ts` matches your deployed program:
```typescript
export const PROGRAM_ID = new PublicKey(
  "CmGDsQogstiHGi69wSBU2UDVqDYrm1uqvhoBcKgX5Aji"
);
```

## Running the App

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### 1. Wallet Connection
- Uses Solana Wallet Adapter to connect to Phantom or other wallets
- Connects to Devnet by default

### 2. User Profile Creation
- Each wallet creates a PDA-based user profile
- Profile stores username and note count
- PDA seeds: `["user_profile", wallet_pubkey]`

### 3. Note Management
- Notes are PDAs derived from user's wallet and note ID
- PDA seeds: `["note", wallet_pubkey, note_id_bytes]`
- Each note stores: authority, id, title, content

### 4. PDA Derivation
The frontend derives the same PDAs as your Anchor program:
```typescript
// User Profile PDA
PublicKey.findProgramAddressSync(
  [Buffer.from("user_profile"), userPubkey.toBuffer()],
  PROGRAM_ID
);

// Note PDA
PublicKey.findProgramAddressSync(
  [Buffer.from("note"), userPubkey.toBuffer(), noteIdBuffer],
  PROGRAM_ID
);
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Main page
│   └── globals.css     # Global styles
├── components/
│   ├── WalletProvider.tsx  # Solana wallet context
│   ├── Dashboard.tsx       # Main dashboard
│   ├── CreateUser.tsx      # Profile creation
│   ├── CreateNote.tsx      # Note creation
│   ├── NoteList.tsx        # Notes display
│   └── NoteCard.tsx        # Individual note
├── hooks/
│   └── useNoteProgram.ts   # Program interaction hook
├── types/
│   └── note.ts             # TypeScript types
└── utils/
    ├── idl.ts              # Program IDL
    └── constants.ts        # Constants & config
```

## Troubleshooting

### "Wallet not connected"
- Make sure your wallet is connected
- Check that you're on Devnet network in your wallet

### "User profile not found"
- You need to create a profile first
- Make sure you have Devnet SOL for the transaction

### "Transaction failed"
- Check you have enough Devnet SOL
- Verify the program is deployed and the Program ID is correct
- Check browser console for detailed errors

### IDL Mismatch
If you get account deserialization errors, make sure your IDL matches your deployed program exactly.

## Customization

### Adding More Wallets
Edit `src/components/WalletProvider.tsx`:
```typescript
const wallets = useMemo(() => [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  // Add more wallets here
], []);
```

### Switching Networks
Edit `src/utils/constants.ts`:
```typescript
// For mainnet (when ready)
export const NETWORK = clusterApiUrl("mainnet-beta");

// For localnet (testing)
export const NETWORK = "http://localhost:8899";
```

## Security Notes

- All transactions require wallet signature
- PDAs ensure users can only modify their own notes
- Authority checks are enforced on-chain
- Private keys never leave your wallet

## Next Steps

1. Add search/filter functionality for notes
2. Implement note categories or tags
3. Add rich text editing
4. Create sharing features
5. Deploy to mainnet when ready

## License

MIT
