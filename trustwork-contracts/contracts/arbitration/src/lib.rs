#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map};

#[contracttype]
pub enum DataKey {
    Dispute(u64),
    EscrowContract,
    TrustToken,
}

#[contracttype]
#[derive(Clone)]
pub enum VoteFavor {
    Client,
    Freelancer,
    Split,
}

#[contracttype]
#[derive(Clone)]
pub struct Dispute {
    pub job_id: u64,
    pub votes_client: u32,
    pub votes_freelancer: u32,
    pub resolved: bool,
}

#[contract]
pub struct Arbitration;

#[contractimpl]
impl Arbitration {
    pub fn vote(env: Env, arbitrator: Address, job_id: u64, favor: VoteFavor) {
        arbitrator.require_auth();

        // TODO: check arbitrator has 100+ TRUST via inter-contract call to trust_token

        let mut dispute: Dispute = env.storage().persistent()
            .get(&DataKey::Dispute(job_id))
            .unwrap_or(Dispute {
                job_id,
                votes_client: 0,
                votes_freelancer: 0,
                resolved: false,
            });

        assert!(!dispute.resolved, "already resolved");

        match favor {
            VoteFavor::Client => dispute.votes_client += 1,
            VoteFavor::Freelancer => dispute.votes_freelancer += 1,
            VoteFavor::Split => {
                dispute.votes_client += 1;
                dispute.votes_freelancer += 1;
            }
        }

        // auto-resolve at 3 votes
        if dispute.votes_client >= 3 || dispute.votes_freelancer >= 3 {
            dispute.resolved = true;
            // inter-contract call to escrow to release/refund
            env.events().publish(
                (soroban_sdk::Symbol::new(&env, "DisputeResolved"),),
                (job_id, dispute.votes_freelancer > dispute.votes_client),
            );
        }

        env.storage().persistent().set(&DataKey::Dispute(job_id), &dispute);
    }
}