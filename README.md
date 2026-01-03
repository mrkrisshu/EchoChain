# EchoChain

> **Voice = NFT + License + Payment**

EchoChain is a Solana-native protocol that represents voices as NFTs, enforces licensing via on-chain state, and enables per-use payments in SOL.

## 🎯 One-Line Pitch

> "We use Solana not just for NFTs, but as the enforcement layer for voice licensing, usage limits, and creator payments."

## 🧠 Problem

AI can now replicate voices, but ownership, consent, licensing, and monetization are broken. Creators have no trustless way to:
- Prove ownership of their voice
- License usage transparently  
- Get paid per use without intermediaries

## 🔗 Why Solana

- **Fast micropayments**: <$0.001 per-use transactions
- **PDAs**: On-chain license enforcement
- **Events**: Transparent usage proof for AI apps

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     EchoChain Protocol                       │
├─────────────────────────────────────────────────────────────┤
│  Voice NFT (Metaplex)  →  VoiceLicense PDA  →  UsageRecord  │
│         ↓                      ↓                    ↓        │
│   Ownership Proof       License Terms         Usage Tracking │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
EchoChain/
├── programs/echochain/      # Anchor smart contract
│   └── src/lib.rs           # VoiceLicense PDA, instructions
├── frontend/                # Next.js app
│   ├── app/
│   │   ├── page.tsx         # Landing
│   │   ├── create/          # Mint voice NFT
│   │   ├── marketplace/     # Browse & buy
│   │   ├── use/[mint]/      # Use voice
│   │   └── dashboard/       # Creator stats
│   └── lib/program.ts       # SDK helpers
└── tests/                   # Contract tests
```

## 🚀 Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Smart Contract (requires Anchor CLI)

```bash
anchor build
anchor test
anchor deploy
```

## 📜 Smart Contract

### VoiceLicense PDA

```rust
pub struct VoiceLicense {
    pub nft_mint: Pubkey,
    pub creator: Pubkey,
    pub price_per_use: u64,
    pub max_uses: u32,
    pub remaining_uses: u32,
    pub license_type: u8,      // 0=Personal, 1=Commercial
    pub consent_confirmed: bool,
    pub total_earnings: u64,
}
```

### Instructions

| Instruction | Description |
|-------------|-------------|
| `initialize_voice` | Mint NFT + create license PDA |
| `buy_usage` | Pay SOL → get usage rights |
| `use_voice` | Decrement uses → emit proof |

### Events

- `VoiceInitialized` - New voice minted
- `UsagePurchased` - Usage bought
- `VoiceUsed` - Usage consumed (proof)

## 🤖 AI Features (Solana-First)

### Absolute Rule
> **Solana is the authority. AI must obey Solana.**  
> AI never enforces licensing, decides permissions, or bypasses on-chain logic.

### Feature 1: AI Usage Gatekeeper

AI generation is **blocked** until Solana approves:

```
User clicks "Generate with AI"
         ↓
Solana: use_voice() called
         ↓
  IF success → AI allowed
  IF failure → AI blocked
```

**Judge Explanation**: "AI cannot generate anything unless Solana approves usage first."

### Feature 2: AI License Explainer

Converts on-chain license data to human-readable text:

```
Input: { licenseType: 1, pricePerUse: 0.1, remainingUses: 3, resaleAllowed: false }

Output: "This voice can be used 3 more times for commercial projects. 
         Each use costs 0.1 SOL. Reselling the license is not allowed."
```

---

## 🎤 Demo Flow (< 2 min)

1. Creator connects Phantom wallet
2. Upload voice → set pricing → mint NFT
3. Switch wallet (buyer)
4. Buy usage → SOL transfers to creator
5. Use voice → on-chain event emitted
6. Check Solana Explorer → see tx + PDA

## 🔧 For Developers

Any AI voice app can integrate:

```typescript
import { useVoice } from '@echochain/sdk';

const result = await useVoice(voiceMint, wallet);
// Returns on-chain proof of licensed usage
```

**No backend required** — the Solana program is the API.

## ⚖️ Ethical Consent

Every voice mint requires explicit consent confirmation stored on-chain:

> "I confirm I own the rights to this voice."

This is enforced in the smart contract and UI.

## 🏆 Hackathon Submission

**Track**: AI Blockchain dApps

**Key Innovation**: Using Solana PDAs as the enforcement layer for voice licensing, not just NFT minting.

## 📄 License

MIT
