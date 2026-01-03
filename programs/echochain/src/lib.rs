use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("ECho1111111111111111111111111111111111111111");

#[program]
pub mod echochain {
    use super::*;

    /// Initialize a new Voice NFT with licensing terms
    /// Creates the Voice NFT mint and VoiceLicense PDA
    pub fn initialize_voice(
        ctx: Context<InitializeVoice>,
        price_per_use: u64,
        max_uses: u32,
        license_type: u8,
        resale_allowed: bool,
        royalty_bps: u16,
        metadata_uri: String,
        name: String,
        symbol: String,
    ) -> Result<()> {
        require!(max_uses > 0, EchoError::InvalidMaxUses);
        require!(royalty_bps <= 10000, EchoError::InvalidRoyalty);
        require!(license_type <= 1, EchoError::InvalidLicenseType);

        let voice_license = &mut ctx.accounts.voice_license;
        voice_license.nft_mint = ctx.accounts.mint.key();
        voice_license.creator = ctx.accounts.creator.key();
        voice_license.price_per_use = price_per_use;
        voice_license.max_uses = max_uses;
        voice_license.remaining_uses = max_uses;
        voice_license.license_type = license_type;
        voice_license.resale_allowed = resale_allowed;
        voice_license.royalty_bps = royalty_bps;
        voice_license.consent_confirmed = true; // Creator confirms by signing tx
        voice_license.total_earnings = 0;
        voice_license.total_uses = 0;
        voice_license.bump = ctx.bumps.voice_license;

        // Mint 1 NFT to creator
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.creator_token_account.to_account_info(),
            authority: ctx.accounts.creator.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, 1)?;

        emit!(VoiceInitialized {
            mint: ctx.accounts.mint.key(),
            creator: ctx.accounts.creator.key(),
            price_per_use,
            max_uses,
            license_type,
            metadata_uri,
        });

        Ok(())
    }

    /// Buy usage rights for a voice
    /// Transfers SOL from buyer to creator
    pub fn buy_usage(ctx: Context<BuyUsage>, uses_to_buy: u32) -> Result<()> {
        let voice_license = &mut ctx.accounts.voice_license;
        
        require!(uses_to_buy > 0, EchoError::InvalidUsesAmount);
        require!(
            voice_license.remaining_uses >= uses_to_buy,
            EchoError::InsufficientUsesAvailable
        );

        let total_cost = voice_license
            .price_per_use
            .checked_mul(uses_to_buy as u64)
            .ok_or(EchoError::Overflow)?;

        // Transfer SOL from buyer to creator
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.creator.key(),
            total_cost,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.creator.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Create or update buyer's usage record
        let usage_record = &mut ctx.accounts.usage_record;
        usage_record.voice_mint = voice_license.nft_mint;
        usage_record.buyer = ctx.accounts.buyer.key();
        usage_record.remaining_uses = usage_record
            .remaining_uses
            .checked_add(uses_to_buy)
            .ok_or(EchoError::Overflow)?;
        usage_record.bump = ctx.bumps.usage_record;

        // Update voice license stats
        voice_license.remaining_uses = voice_license
            .remaining_uses
            .checked_sub(uses_to_buy)
            .ok_or(EchoError::Overflow)?;
        voice_license.total_earnings = voice_license
            .total_earnings
            .checked_add(total_cost)
            .ok_or(EchoError::Overflow)?;

        emit!(UsagePurchased {
            mint: voice_license.nft_mint,
            buyer: ctx.accounts.buyer.key(),
            uses_purchased: uses_to_buy,
            amount_paid: total_cost,
            remaining_available: voice_license.remaining_uses,
        });

        Ok(())
    }

    /// Use the voice - decrements usage and emits proof
    pub fn use_voice(ctx: Context<UseVoice>) -> Result<()> {
        let usage_record = &mut ctx.accounts.usage_record;
        let voice_license = &mut ctx.accounts.voice_license;

        require!(usage_record.remaining_uses > 0, EchoError::NoUsesRemaining);

        usage_record.remaining_uses = usage_record
            .remaining_uses
            .checked_sub(1)
            .ok_or(EchoError::Overflow)?;

        voice_license.total_uses = voice_license
            .total_uses
            .checked_add(1)
            .ok_or(EchoError::Overflow)?;

        emit!(VoiceUsed {
            mint: voice_license.nft_mint,
            user: ctx.accounts.user.key(),
            remaining_uses: usage_record.remaining_uses,
            total_uses: voice_license.total_uses,
        });

        Ok(())
    }
}

// ============== ACCOUNTS ==============

#[derive(Accounts)]
#[instruction(price_per_use: u64, max_uses: u32, license_type: u8, resale_allowed: bool, royalty_bps: u16, metadata_uri: String, name: String, symbol: String)]
pub struct InitializeVoice<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        mint::decimals = 0,
        mint::authority = creator,
        mint::freeze_authority = creator,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = creator,
        associated_token::mint = mint,
        associated_token::authority = creator,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = creator,
        space = 8 + VoiceLicense::INIT_SPACE,
        seeds = [b"voice_license", mint.key().as_ref()],
        bump
    )]
    pub voice_license: Account<'info, VoiceLicense>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyUsage<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Creator receives SOL payment
    #[account(
        mut,
        constraint = creator.key() == voice_license.creator @ EchoError::InvalidCreator
    )]
    pub creator: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"voice_license", voice_license.nft_mint.as_ref()],
        bump = voice_license.bump
    )]
    pub voice_license: Account<'info, VoiceLicense>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + UsageRecord::INIT_SPACE,
        seeds = [b"usage_record", voice_license.nft_mint.as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub usage_record: Account<'info, UsageRecord>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UseVoice<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"voice_license", voice_license.nft_mint.as_ref()],
        bump = voice_license.bump
    )]
    pub voice_license: Account<'info, VoiceLicense>,

    #[account(
        mut,
        seeds = [b"usage_record", voice_license.nft_mint.as_ref(), user.key().as_ref()],
        bump = usage_record.bump,
        constraint = usage_record.buyer == user.key() @ EchoError::UnauthorizedUser
    )]
    pub usage_record: Account<'info, UsageRecord>,
}

// ============== STATE ==============

#[account]
#[derive(InitSpace)]
pub struct VoiceLicense {
    pub nft_mint: Pubkey,          // 32 bytes - Voice NFT mint address
    pub creator: Pubkey,            // 32 bytes - Creator wallet
    pub price_per_use: u64,         // 8 bytes - Price in lamports
    pub max_uses: u32,              // 4 bytes - Total allowed uses
    pub remaining_uses: u32,        // 4 bytes - Uses left to sell
    pub license_type: u8,           // 1 byte - 0=Personal, 1=Commercial
    pub resale_allowed: bool,       // 1 byte - Can license be resold
    pub royalty_bps: u16,           // 2 bytes - Royalty basis points
    pub consent_confirmed: bool,    // 1 byte - Creator consent flag
    pub total_earnings: u64,        // 8 bytes - Total SOL earned
    pub total_uses: u32,            // 4 bytes - Total times used
    pub bump: u8,                   // 1 byte - PDA bump
}

#[account]
#[derive(InitSpace)]
pub struct UsageRecord {
    pub voice_mint: Pubkey,         // 32 bytes - Voice NFT mint
    pub buyer: Pubkey,              // 32 bytes - Buyer wallet
    pub remaining_uses: u32,        // 4 bytes - Uses remaining
    pub bump: u8,                   // 1 byte - PDA bump
}

// ============== EVENTS ==============

#[event]
pub struct VoiceInitialized {
    pub mint: Pubkey,
    pub creator: Pubkey,
    pub price_per_use: u64,
    pub max_uses: u32,
    pub license_type: u8,
    pub metadata_uri: String,
}

#[event]
pub struct UsagePurchased {
    pub mint: Pubkey,
    pub buyer: Pubkey,
    pub uses_purchased: u32,
    pub amount_paid: u64,
    pub remaining_available: u32,
}

#[event]
pub struct VoiceUsed {
    pub mint: Pubkey,
    pub user: Pubkey,
    pub remaining_uses: u32,
    pub total_uses: u32,
}

// ============== ERRORS ==============

#[error_code]
pub enum EchoError {
    #[msg("Max uses must be greater than 0")]
    InvalidMaxUses,
    #[msg("Royalty basis points must be <= 10000")]
    InvalidRoyalty,
    #[msg("License type must be 0 (Personal) or 1 (Commercial)")]
    InvalidLicenseType,
    #[msg("Uses to buy must be greater than 0")]
    InvalidUsesAmount,
    #[msg("Not enough uses available for purchase")]
    InsufficientUsesAvailable,
    #[msg("No uses remaining")]
    NoUsesRemaining,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Invalid creator account")]
    InvalidCreator,
    #[msg("Unauthorized user")]
    UnauthorizedUser,
}
