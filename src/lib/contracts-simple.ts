import { 
  Networks,
  Contract,
  xdr,
  ScInt,
  Address as StellarAddress
} from '@stellar/stellar-sdk';

// Contract IDs from your deployment
export const CONTRACT_IDS = {
  TRUST_TOKEN: 'CBDBVAAXBZALUPJZMD3TLWVD7223DAIOISQCX37JXMEMVKWUO3MPR6UH',
  REGISTRY: 'CC6XVPXDWXDJSXPUM6O7TZFYPFCPZT2NKCRP2N7Z2R5NZ4XY35EV34RT',
  ESCROW: 'CASEGYRY6B5BOVQNY5TEKFTH4VPSFERSE3YLO7DEPBE3WMGDZR736XE6',
  ARBITRATION: 'CAW5AM4ZTW6GLZKY3YF722OHHPGVYT6OPOGCDONOGYVZQBYSNBU32YBY',
} as const;

// Stellar network configuration
export const STELLAR_CONFIG = {
  network: Networks.TESTNET,
  horizonUrl: 'https://horizon-testnet.stellar.org',
  rpcUrl: 'https://soroban-testnet.stellar.org',
};

export interface JobData {
  id: number;
  client: string;
  title: string;
  budget: string;
  status: 'Open' | 'InProgress' | 'Completed' | 'Disputed' | 'Cancelled';
  freelancer?: string;
}

export interface EscrowData {
  job_id: number;
  client: string;
  freelancer?: string;
  amount: string;
  released: string;
  disputed: boolean;
}

// Simple contract interaction utilities
export class StellarUtils {
  static getContract(contractName: keyof typeof CONTRACT_IDS): Contract {
    return new Contract(CONTRACT_IDS[contractName]);
  }

  static createAddressScVal(address: string): xdr.ScVal {
    return new StellarAddress(address).toScVal();
  }

  static createStringScVal(value: string): xdr.ScVal {
    return xdr.ScVal.scvString(value);
  }

  static createI128ScVal(value: string): xdr.ScVal {
    return new ScInt(value).toI128();
  }

  static createU64ScVal(value: string): xdr.ScVal {
    return new ScInt(value).toU64();
  }

  static createU32ScVal(value: number): xdr.ScVal {
    return xdr.ScVal.scvU32(value);
  }

  // Helper to parse contract results
  static parseJobData(jobId: string, rawResult: unknown): JobData | null {
    try {
      if (!rawResult) return null;
      
      const result = rawResult as Record<string, { toString: () => string } | undefined>;
      
      return {
        id: parseInt(jobId),
        client: result.client?.toString() || '',
        title: result.title?.toString() || '',
        budget: result.budget?.toString() || '0',
        status: (result.status?.toString() as 'Open' | 'InProgress' | 'Completed' | 'Disputed' | 'Cancelled') || 'Open',
        freelancer: result.freelancer?.toString(),
      };
    } catch (error) {
      console.error('Failed to parse job data:', error);
      return null;
    }
  }

  static parseEscrowData(jobId: string, rawResult: unknown): EscrowData | null {
    try {
      if (!rawResult) return null;
      
      const result = rawResult as Record<string, unknown>;
      
      return {
        job_id: parseInt(jobId),
        client: (result.client as { toString: () => string })?.toString() || '',
        freelancer: (result.freelancer as { toString: () => string })?.toString(),
        amount: (result.amount as { toString: () => string })?.toString() || '0',
        released: (result.released as { toString: () => string })?.toString() || '0',
        disputed: Boolean(result.disputed),
      };
    } catch (error) {
      console.error('Failed to parse escrow data:', error);
      return null;
    }
  }
}

// Contract method builders
export const ContractMethods = {
  // Trust Token
  trustToken: {
    initialize: (admin: string, escrowContract: string) => [
      StellarUtils.createAddressScVal(admin),
      StellarUtils.createAddressScVal(escrowContract),
    ],
    balance: (address: string) => [
      StellarUtils.createAddressScVal(address),
    ],
  },

  // Registry
  registry: {
    postJob: (client: string, title: string, budget: string) => [
      StellarUtils.createAddressScVal(client),
      StellarUtils.createStringScVal(title),
      StellarUtils.createI128ScVal(budget),
    ],
    getJob: (jobId: string) => [
      StellarUtils.createU64ScVal(jobId),
    ],
    getJobCount: () => [],
  },

  // Escrow
  escrow: {
    initialize: (trustToken: string, registry: string) => [
      StellarUtils.createAddressScVal(trustToken),
      StellarUtils.createAddressScVal(registry),
    ],
    lockFunds: (client: string, jobId: string, amount: string, xlmToken: string) => [
      StellarUtils.createAddressScVal(client),
      StellarUtils.createU64ScVal(jobId),
      StellarUtils.createI128ScVal(amount),
      StellarUtils.createAddressScVal(xlmToken),
    ],
    approveMilestone: (client: string, jobId: string, payout: string, xlmToken: string) => [
      StellarUtils.createAddressScVal(client),
      StellarUtils.createU64ScVal(jobId),
      StellarUtils.createI128ScVal(payout),
      StellarUtils.createAddressScVal(xlmToken),
    ],
    raiseDispute: (caller: string, jobId: string) => [
      StellarUtils.createAddressScVal(caller),
      StellarUtils.createU64ScVal(jobId),
    ],
    getEscrow: (jobId: string) => [
      StellarUtils.createU64ScVal(jobId),
    ],
  },

  // Arbitration
  arbitration: {
    vote: (arbitrator: string, jobId: string, favor: 'client' | 'freelancer' | 'split') => {
      const favorMap = {
        client: 0,
        freelancer: 1,
        split: 2,
      };
      return [
        StellarUtils.createAddressScVal(arbitrator),
        StellarUtils.createU64ScVal(jobId),
        StellarUtils.createU32ScVal(favorMap[favor]),
      ];
    },
  },
};
