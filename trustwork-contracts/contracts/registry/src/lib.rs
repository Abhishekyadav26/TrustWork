#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol};


#[contracttype]
pub enum DataKey {
    Job(u64),
    JobCount,
    UserReputation(Address),
}

#[contracttype]
#[derive(Clone)]
pub enum JobStatus {
    Open,
    InProgress,
    Completed,
    Disputed,
    Cancelled,
}

#[contracttype]
#[derive(Clone)]
pub struct Job {
    pub id: u64,
    pub client: Address,
    pub title: String,
    pub budget: i128,
    pub status: JobStatus,
    pub freelancer: Option<Address>,
}

#[contract]
pub struct Registry;

#[contractimpl]
impl Registry {
    pub fn post_job(env: Env, client: Address, title: String, budget: i128) -> u64 {
        client.require_auth();

        let id: u64 = env.storage().instance()
            .get(&DataKey::JobCount)
            .unwrap_or(0) + 1;

        let job = Job {
            id,
            client,
            title,
            budget,
            status: JobStatus::Open,
            freelancer: None,
        };

        env.storage().persistent().set(&DataKey::Job(id), &job);
        env.storage().instance().set(&DataKey::JobCount, &id);

        // emit event for real-time streaming
        env.events().publish(
            (symbol_short!("JobPosted"),),
            (id, job.budget),
        );

        id
    }

    pub fn get_job(env: Env, job_id: u64) -> Job {
        env.storage().persistent().get(&DataKey::Job(job_id)).unwrap()
    }

    pub fn get_job_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::JobCount).unwrap_or(0)
    }
}