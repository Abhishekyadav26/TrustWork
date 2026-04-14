'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobData } from '@/lib/contracts-simple';
import { Clock, DollarSign, User, ExternalLink } from 'lucide-react';

interface JobBoardProps {
  address: string;
}

export function JobBoard({ address }: JobBoardProps) {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - in real implementation, this would fetch from contracts
    const mockJobs: JobData[] = [
      {
        id: 1,
        client: 'GCLIENT123456789',
        title: 'Build React Dashboard',
        budget: '1000',
        status: 'Open',
        freelancer: undefined,
      },
      {
        id: 2,
        client: 'GCLIENT987654321',
        title: 'Smart Contract Audit',
        budget: '2500',
        status: 'InProgress',
        freelancer: 'GFREELANCER123',
      },
      {
        id: 3,
        client: 'GCLIENT567890123',
        title: 'UI/UX Design for DApp',
        budget: '1500',
        status: 'Completed',
        freelancer: 'GFREELANCER456',
      },
    ];

    setTimeout(() => {
      setJobs(mockJobs);
      setIsLoading(false);
    }, 1000);
  }, [address]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-800';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Disputed':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApplyForJob = (jobId: number) => {
    console.log('Applying for job:', jobId);
    // In real implementation, this would call the contract
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

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client: {job.client.slice(0, 8)}...
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">{job.budget} XLM</span>
                  </div>
                  {job.freelancer && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Assigned to: {job.freelancer.slice(0, 8)}...
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {job.status === 'Open' && (
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

      {jobs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No jobs available</h3>
            <p className="text-muted-foreground">Check back later for new opportunities</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
