import freighterApi from '@stellar/freighter-api';
import { 
  Horizon, 
  TransactionBuilder, 
  Networks, 
  BASE_FEE,
  Asset,
  Operation
} from '@stellar/stellar-sdk';

export interface WalletInfo {
  publicKey: string;
  isConnected: boolean;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export class StellarWallet {
  private server: Horizon.Server;
  private networkPassphrase: string;

  constructor() {
    // Use testnet for development
    this.server = new Horizon.Server('https://horizon-testnet.stellar.org');
    this.networkPassphrase = Networks.TESTNET;
  }

  /**
   * Check if Freighter wallet is available
   */
  async isFreighterAvailable(): Promise<boolean> {
    try {
      // Check if freighter is available by trying to access the API
      return typeof window !== 'undefined' && !!(window as unknown as { freighters?: unknown }).freighters;
    } catch (error) {
      console.error('Error checking Freighter availability:', error);
      return false;
    }
  }

  /**
   * Connect to Freighter wallet and get public key
   */
  async connectWallet(): Promise<WalletInfo> {
    try {
      const isAvailable = await this.isFreighterAvailable();
      if (!isAvailable) {
        throw new Error('Freighter wallet is not available. Please install Freighter extension.');
      }

      const response = await freighterApi.getAddress();
      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.address) {
        throw new Error('Failed to get public key from Freighter wallet');
      }

      return {
        publicKey: response.address,
        isConnected: true
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet (client-side only)
   */
  disconnectWallet(): WalletInfo {
    return {
      publicKey: '',
      isConnected: false
    };
  }

  /**
   * Get account details
   */
  async getAccountDetails(publicKey: string): Promise<Horizon.AccountResponse> {
    try {
      const account = await this.server.loadAccount(publicKey);
      return account;
    } catch (error) {
      console.error('Error fetching account details:', error);
      throw new Error('Failed to fetch account details');
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(publicKey: string): Promise<{ asset: string; balance: string }[]> {
    try {
      const account = await this.getAccountDetails(publicKey);
      return account.balances.map((balance) => ({
        asset: balance.asset_type === 'native' ? 'XLM' : (balance as { asset_code?: string }).asset_code || 'Unknown',
        balance: balance.balance
      }));
    } catch (error) {
      console.error('Error fetching account balance:', error);
      throw new Error('Failed to fetch account balance');
    }
  }

  /**
   * Sign and submit transaction using Freighter
   */
  async signAndSubmitTransaction(xdr: string): Promise<TransactionResult> {
    try {
      const signedTx = await freighterApi.signTransaction(xdr, {
        networkPassphrase: this.networkPassphrase,
      });

      if (signedTx.error) {
        throw new Error(signedTx.error);
      }

      const transaction = this.server.submitTransaction(
        TransactionBuilder.fromXDR(signedTx.signedTxXdr, this.networkPassphrase)
      );
      
      return {
        success: true,
        txHash: (await transaction).hash
      };
    } catch (error) {
      console.error('Error submitting transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a simple payment transaction
   */
  async createPaymentTransaction(
    fromPublicKey: string,
    toPublicKey: string,
    amount: string,
    asset: Asset = Asset.native()
  ): Promise<string> {
    try {
      const account = await this.server.loadAccount(fromPublicKey);
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(Operation.payment({
          destination: toPublicKey,
          asset,
          amount,
        }))
        .setTimeout(30)
        .build();

      return transaction.toXDR();
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw new Error('Failed to create payment transaction');
    }
  }

  /**
   * Create a contract deployment transaction
   */
  async createContractTransaction(
    fromPublicKey: string,
    _wasmId: string
  ): Promise<string> {
    try {
      const account = await this.server.loadAccount(fromPublicKey);
      
      // This is a simplified version - in reality you'd need to handle
      // Soroban contract deployment properly
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(Operation.payment({
          destination: fromPublicKey,
          asset: Asset.native(),
          amount: '0.00001', // Minimum fee for demo
        }))
        .setTimeout(30)
        .build();

      return transaction.toXDR();
    } catch (error) {
      console.error('Error creating contract transaction:', error);
      throw new Error('Failed to create contract transaction');
    }
  }

  /**
   * Create contract invocation transaction
   */
  async createContractInvocationTransaction(
    fromPublicKey: string,
    contractId: string,
    functionName: string,
    _args: unknown[] = []
  ): Promise<string> {
    try {
      const account = await this.server.loadAccount(fromPublicKey);
      
      // This is a simplified version - in reality you'd need to handle
      // Soroban contract invocation properly
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(Operation.payment({
          destination: fromPublicKey,
          asset: Asset.native(),
          amount: '0.00001', // Minimum fee for demo
        }))
        .setTimeout(30)
        .build();

      return transaction.toXDR();
    } catch (error) {
      console.error('Error creating contract invocation transaction:', error);
      throw new Error('Failed to create contract invocation transaction');
    }
  }
}

// Export singleton instance
export const stellarWallet = new StellarWallet();
