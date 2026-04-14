#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[contracttype]
pub enum DataKey {
    Balance(Address),
    Admin,
    EscrowContract, // only escrow can mint
}

#[contract]
pub struct TrustToken;

#[contractimpl]
impl TrustToken {
    pub fn initialize(env: Env, admin: Address, escrow_contract: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::EscrowContract, &escrow_contract);
    }

    pub fn mint(env: Env, caller: Address, to: Address, amount: i128) {
        // only escrow contract can mint
        let escrow: Address = env.storage().instance().get(&DataKey::EscrowContract).unwrap();
        caller.require_auth();
        assert!(caller == escrow, "unauthorized");

        let balance: i128 = env.storage().persistent()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);
        env.storage().persistent()
            .set(&DataKey::Balance(to), &(balance + amount));
    }

    pub fn balance(env: Env, address: Address) -> i128 {
        env.storage().persistent()
            .get(&DataKey::Balance(address))
            .unwrap_or(0)
    }

    // transfer is intentionally NOT implemented — soul-bound token
}