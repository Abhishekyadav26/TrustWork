'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Send } from 'lucide-react';

interface PostJobProps {
  address: string;
}

export function PostJob({ address }: PostJobProps) {
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !budget) return;

    setIsLoading(true);
    try {
      console.log('Posting job:', { title, budget, client: address });
      // In real implementation, this would call the contract
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction
      
      setTitle('');
      setBudget('');
      alert('Job posted successfully!');
    } catch (error) {
      console.error('Failed to post job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Post a Job</h2>
        <p className="text-muted-foreground">Create a new job posting for freelancers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Fill in the details for your job posting. Funds will be locked in escrow once posted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Job Title
              </label>
              <Input
                id="title"
                placeholder="e.g., Build React Dashboard, Smart Contract Audit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="budget" className="text-sm font-medium">
                Budget (XLM)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  placeholder="1000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-10"
                  min="1"
                  step="0.0000001"
                  required
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Posting Information</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your wallet address: {address.slice(0, 8)}...{address.slice(-4)}</li>
                <li>• Budget will be locked in escrow when job is posted</li>
                <li>• TRUST tokens will be minted to freelancer on milestone completion</li>
                <li>• Dispute resolution available through arbitration</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !title || !budget}
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Posting Job...' : 'Post Job'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
