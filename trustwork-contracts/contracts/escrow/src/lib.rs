#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, IntoVal
};

// This is the inter-contract call import
use soroban_sdk::xdr::ToXdr;

#[contracttype]
pub enum DataKey {
    Escrow(u64),
    TrustToken,    // address of trust_token contract
    Registry,      // address of registry contract
}

#[contracttype]
#[derive(Clone)]
pub struct EscrowRecord {
    pub job_id: u64,
    pub client: Address,
    pub freelancer: Option<Address>,
    pub amount: i128,
    pub released: i128,
    pub disputed: bool,
}

#[contract]
pub struct Escrow;

#[contractimpl]
impl Escrow {
    pub fn initialize(env: Env, trust_token: Address, registry: Address) {
        env.storage().instance().set(&DataKey::TrustToken, &trust_token);
        env.storage().instance().set(&DataKey::Registry, &registry);
    }

    pub fn lock_funds(env: Env, client: Address, job_id: u64, amount: i128, xlm_token: Address) {
        client.require_auth();

        // transfer XLM from client to this contract
        let token_client = token::Client::new(&env, &xlm_token);
        token_client.transfer(&client, &env.current_contract_address(), &amount);

        let record = EscrowRecord {
            job_id,
            client,
            freelancer: None,
            amount,
            released: 0,
            disputed: false,
        };

        env.storage().persistent().set(&DataKey::Escrow(job_id), &record);
    }

    pub fn approve_milestone(env: Env, client: Address, job_id: u64, payout: i128, xlm_token: Address) {
        client.require_auth();

        let mut record: EscrowRecord = env.storage().persistent()
            .get(&DataKey::Escrow(job_id)).unwrap();

        assert!(!record.disputed, "dispute active");
        assert!(record.released + payout <= record.amount, "exceeds escrow");

        let freelancer = record.freelancer.clone().unwrap();

        // pay freelancer
        let token_client = token::Client::new(&env, &xlm_token);
        token_client.transfer(&env.current_contract_address(), &freelancer, &payout);

        record.released += payout;
        env.storage().persistent().set(&DataKey::Escrow(job_id), &record);

        // ── INTER-CONTRACT CALL ──────────────────────────────
        // mint TRUST token to freelancer as reputation reward
        let trust_token: Address = env.storage().instance()
            .get(&DataKey::TrustToken).unwrap();

        env.invoke_contract::<()>(
            &trust_token,
            &soroban_sdk::Symbol::new(&env, "mint"),
            soroban_sdk::vec![
                &env,
                env.current_contract_address().into_val(&env),
                freelancer.into_val(&env),
                10_i128.into_val(&env),  // +10 TRUST per milestone
            ],
        );
        // ────────────────────────────────────────────────────

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "MilestoneApproved"),),
            (job_id, payout),
        );
    }

    pub fn raise_dispute(env: Env, caller: Address, job_id: u64) {
        caller.require_auth();
        let mut record: EscrowRecord = env.storage().persistent()
            .get(&DataKey::Escrow(job_id)).unwrap();

        assert!(!record.disputed, "already disputed");
        record.disputed = true;
        env.storage().persistent().set(&DataKey::Escrow(job_id), &record);

        env.events().publish(
            (soroban_sdk::Symbol::new(&env, "DisputeRaised"),),
            job_id,
        );
    }

    pub fn get_escrow(env: Env, job_id: u64) -> EscrowRecord {
        env.storage().persistent().get(&DataKey::Escrow(job_id)).unwrap()
    }
}