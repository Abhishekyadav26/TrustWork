"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { stellarContractManager, JobContract } from "@/lib/stellar-contracts";
import { DollarSign, User, ExternalLink, AlertCircle } from "lucide-react";

interface JobBoardProps {
  address: string;
}

export function JobBoard({ address }: JobBoardProps) {
  const [jobs, setJobs] = useState<JobContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [address]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all jobs from Stellar contracts
      const allJobs = await stellarContractManager.getAllJobs();
      setJobs(allJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      case "disputed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const handleApplyForJob = async (jobId: string) => {
    try {
      setError(null);

      // In a real implementation, this would call the contract to apply for the job
      // For now, we'll simulate the application process
      const job = jobs.find((j) => j.id === jobId);
      if (!job) {
        throw new Error("Job not found");
      }

      // Update job status to in_progress and assign freelancer
      job.status = "in_progress";
      job.freelancerAddress = address;

      // Store updated job (in real implementation, this would be a contract call)
      await stellarContractManager.deployJobContract(
        job.clientAddress,
        job.title,
        job.description,
        job.budget,
        job.deadline,
      );

      // Refresh jobs list
      await fetchJobs();

      console.log("Successfully applied for job:", jobId);
    } catch (err) {
      console.error("Error applying for job:", err);
      setError(err instanceof Error ? err.message : "Failed to apply for job");
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 8)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Job Board</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Job Board</h2>
        <p className="text-muted-foreground">{jobs.length} jobs available</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client: {formatAddress(job.clientAddress)}
                  </CardDescription>
                  <CardDescription>
                    Posted: {formatDate(job.createdAt)}
                    {job.deadline && ` • Deadline: ${formatDate(job.deadline)}`}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(job.status)}>
                  {job.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {job.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">{job.budget} XLM</span>
                  </div>
                  {job.freelancerAddress && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Assigned to: {formatAddress(job.freelancerAddress)}
                    </div>
                  )}
                  {job.milestones.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {job.milestones.length} milestone
                      {job.milestones.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {job.status === "open" && address !== job.clientAddress && (
                    <Button onClick={() => handleApplyForJob(job.id)}>
                      Apply Now
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobs.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No jobs available</h3>
            <p className="text-muted-foreground">
              Be the first to post a job or check back later for new
              opportunities
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
