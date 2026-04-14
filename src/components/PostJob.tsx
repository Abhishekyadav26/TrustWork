"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Send, AlertCircle, Calendar } from "lucide-react";
import { stellarContractManager } from "@/lib/stellar-contracts";

interface PostJobProps {
  address: string;
}

export function PostJob({ address }: PostJobProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !budget || !description) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert deadline to timestamp if provided
      const deadlineTimestamp = deadline
        ? new Date(deadline).getTime()
        : undefined;

      // Deploy job contract on Stellar
      const result = await stellarContractManager.deployJobContract(
        address,
        title,
        description,
        budget,
        deadlineTimestamp,
      );

      if (result.success) {
        setSuccess("Job posted successfully! Transaction hash: " + result.hash);
        // Reset form
        setTitle("");
        setDescription("");
        setBudget("");
        setDeadline("");
      } else {
        setError(result.error || "Failed to post job");
      }
    } catch (err) {
      console.error("Failed to post job:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to post job. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 8)}`;
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Post a Job</h2>
        <p className="text-muted-foreground">
          Create a new job posting for freelancers on Stellar
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700 dark:text-green-300">
            {success}
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Fill in details for your job posting. The contract will be deployed
            on Stellar blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Job Title *
              </label>
              <Input
                id="title"
                placeholder="e.g., Build React Dashboard, Smart Contract Audit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Job Description *
              </label>
              <Textarea
                id="description"
                placeholder="Describe the job requirements, deliverables, and expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="budget" className="text-sm font-medium">
                Budget (XLM) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  placeholder="1000"
                  value={budget}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBudget(e.target.value)
                  }
                  className="pl-10"
                  min="1"
                  step="0.0000001"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-medium">
                Deadline (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="pl-10"
                  min={minDate}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Posting Information</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your wallet address: {formatAddress(address)}</li>
                <li>• Job contract will be deployed on Stellar Testnet</li>
                <li>• Budget will be locked in escrow when job is accepted</li>
                <li>• Smart contract manages milestones and payments</li>
                <li>• Dispute resolution available through arbitration</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !title || !budget || !description}
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Deploying Contract..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
