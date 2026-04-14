import { stellar, PaymentResult } from './stellar-helper';

export interface JobContract {
  id: string;
  title: string;
  description: string;
  budget: string;
  clientAddress: string;
  freelancerAddress?: string;
  status: 'open' | 'in_progress' | 'completed' | 'disputed';
  milestones: Milestone[];
  createdAt: number;
  deadline?: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: string;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  submittedAt?: number;
  approvedAt?: number;
}

export interface EscrowContract {
  id: string;
  jobId: string;
  amount: string;
  clientAddress: string;
  freelancerAddress: string;
  status: 'funded' | 'released' | 'disputed';
  fundedAt: number;
  releasedAt?: number;
  disputedAt?: number;
}

export class StellarContractManager {
  private stellarHelper = stellar;

  /**
   * Deploy a new job contract
   */
  async deployJobContract(
    clientAddress: string,
    title: string,
    description: string,
    budget: string,
    deadline?: number
  ): Promise<PaymentResult> {
    try {
      // In a real implementation, this would deploy a Soroban smart contract
      // For now, we'll simulate the contract deployment with a transaction
      
      const jobContract: JobContract = {
        id: this.generateContractId(),
        title,
        description,
        budget,
        clientAddress,
        status: 'open',
        milestones: [],
        createdAt: Date.now(),
        deadline
      };

      // Store contract data (in a real app, this would be on-chain)
      this.storeJobContract(jobContract);

      // Create a placeholder transaction for demo purposes
      const txXdr = await stellar.buildPaymentXDR({
        sourcePublicKey: clientAddress,
        destination: clientAddress,
        amount: '0.00001', // Minimum fee for demo
        memo: `Job Contract: ${jobContract.id}`
      });

      const result = await stellar.submitSignedTransaction(txXdr);
      
      if (result.success) {
        return {
          success: true,
          hash: result.hash,
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Error deploying job contract:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fund an escrow contract
   */
  async fundEscrow(
    clientAddress: string,
    jobId: string,
    amount: string,
    freelancerAddress: string
  ): Promise<PaymentResult> {
    try {
      const escrowContract: EscrowContract = {
        id: this.generateContractId(),
        jobId,
        amount,
        clientAddress,
        freelancerAddress,
        status: 'funded',
        fundedAt: Date.now()
      };

      // Store escrow contract
      this.storeEscrowContract(escrowContract);

      // Create payment transaction to fund escrow
      const result = await stellar.sendPayment({
        sourcePublicKey: clientAddress,
        destination: freelancerAddress, // In reality, this would go to an escrow contract
        amount,
        memo: `Escrow: ${escrowContract.id}`
      });

      return result;
    } catch (error) {
      console.error('Error funding escrow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Release funds from escrow
   */
  async releaseEscrow(
    clientAddress: string,
    escrowId: string
  ): Promise<PaymentResult> {
    try {
      const escrow = this.getEscrowContract(escrowId);
      if (!escrow) {
        throw new Error('Escrow contract not found');
      }

      if (escrow.clientAddress !== clientAddress) {
        throw new Error('Only the client can release funds');
      }

      // Update escrow status
      escrow.status = 'released';
      escrow.releasedAt = Date.now();
      this.storeEscrowContract(escrow);

      // In a real implementation, this would invoke the contract to release funds
      // For demo purposes, we'll create a placeholder transaction
      const result = await stellar.sendPayment({
        sourcePublicKey: clientAddress,
        destination: escrow.freelancerAddress,
        amount: escrow.amount,
        memo: `Release Escrow: ${escrowId}`
      });

      return result;
    } catch (error) {
      console.error('Error releasing escrow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Submit milestone for approval
   */
  async submitMilestone(
    freelancerAddress: string,
    jobId: string,
    milestoneId: string,
    _submissionData: string
  ): Promise<PaymentResult> {
    try {
      const job = this.getJobContract(jobId);
      if (!job) {
        throw new Error('Job contract not found');
      }

      const milestone = job.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      // Update milestone status
      milestone.status = 'completed';
      milestone.submittedAt = Date.now();
      this.storeJobContract(job);

      // Create a placeholder transaction for the submission
      const result = await stellar.sendPayment({
        sourcePublicKey: freelancerAddress,
        destination: freelancerAddress,
        amount: '0.00001',
        memo: `Milestone: ${milestoneId}`
      });

      return result;
    } catch (error) {
      console.error('Error submitting milestone:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Approve milestone
   */
  async approveMilestone(
    clientAddress: string,
    jobId: string,
    milestoneId: string
  ): Promise<PaymentResult> {
    try {
      const job = this.getJobContract(jobId);
      if (!job) {
        throw new Error('Job contract not found');
      }

      if (job.clientAddress !== clientAddress) {
        throw new Error('Only the client can approve milestones');
      }

      const milestone = job.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      // Update milestone status
      milestone.status = 'approved';
      milestone.approvedAt = Date.now();
      this.storeJobContract(job);

      // In a real implementation, this would release milestone payment
      const result = await stellar.sendPayment({
        sourcePublicKey: clientAddress,
        destination: job.freelancerAddress || clientAddress,
        amount: milestone.amount,
        memo: `Approve Milestone: ${milestoneId}`
      });

      return result;
    } catch (error) {
      console.error('Error approving milestone:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all job contracts
   */
  async getAllJobs(): Promise<JobContract[]> {
    try {
      const contracts = localStorage.getItem('jobContracts');
      return contracts ? JSON.parse(contracts) : [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  }

  /**
   * Get jobs for a specific user
   */
  async getUserJobs(userAddress: string): Promise<JobContract[]> {
    try {
      const allJobs = await this.getAllJobs();
      return allJobs.filter(job => 
        job.clientAddress === userAddress || job.freelancerAddress === userAddress
      );
    } catch (error) {
      console.error('Error fetching user jobs:', error);
      return [];
    }
  }

  /**
   * Get escrow contracts for a user
   */
  async getUserEscrows(userAddress: string): Promise<EscrowContract[]> {
    try {
      const contracts = localStorage.getItem('escrowContracts');
      const allEscrows = contracts ? JSON.parse(contracts) : [];
      return allEscrows.filter((escrow: EscrowContract) => 
        escrow.clientAddress === userAddress || escrow.freelancerAddress === userAddress
      );
    } catch (error) {
      console.error('Error fetching user escrows:', error);
      return [];
    }
  }

  // Helper methods
  private generateContractId(): string {
    return `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private storeJobContract(contract: JobContract): void {
    try {
      const contracts = localStorage.getItem('jobContracts');
      const allContracts = contracts ? JSON.parse(contracts) : [];
      const index = allContracts.findIndex((c: JobContract) => c.id === contract.id);
      
      if (index >= 0) {
        allContracts[index] = contract;
      } else {
        allContracts.push(contract);
      }
      
      localStorage.setItem('jobContracts', JSON.stringify(allContracts));
    } catch (error) {
      console.error('Error storing job contract:', error);
    }
  }

  private storeEscrowContract(contract: EscrowContract): void {
    try {
      const contracts = localStorage.getItem('escrowContracts');
      const allContracts = contracts ? JSON.parse(contracts) : [];
      const index = allContracts.findIndex((c: EscrowContract) => c.id === contract.id);
      
      if (index >= 0) {
        allContracts[index] = contract;
      } else {
        allContracts.push(contract);
      }
      
      localStorage.setItem('escrowContracts', JSON.stringify(allContracts));
    } catch (error) {
      console.error('Error storing escrow contract:', error);
    }
  }

  private getJobContract(jobId: string): JobContract | null {
    try {
      const contracts = localStorage.getItem('jobContracts');
      const allContracts = contracts ? JSON.parse(contracts) : [];
      return allContracts.find((c: JobContract) => c.id === jobId) || null;
    } catch (error) {
      console.error('Error fetching job contract:', error);
      return null;
    }
  }

  private getEscrowContract(escrowId: string): EscrowContract | null {
    try {
      const contracts = localStorage.getItem('escrowContracts');
      const allContracts = contracts ? JSON.parse(contracts) : [];
      return allContracts.find((c: EscrowContract) => c.id === escrowId) || null;
    } catch (error) {
      console.error('Error fetching escrow contract:', error);
      return null;
    }
  }
}

// Export singleton instance
export const stellarContractManager = new StellarContractManager();
