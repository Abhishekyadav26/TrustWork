"use client";

import { useState } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { JobBoard } from "@/components/JobBoard";
import { PostJob } from "@/components/PostJob";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, PlusCircle, ListTodo, Scale } from "lucide-react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "jobs" | "post" | "escrow" | "arbitration"
  >("jobs");

  const handleConnect = (walletAddress: string) => {
    setAddress(walletAddress);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setAddress("");
    setIsConnected(false);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              TrustWork
            </h1>
            <p className="text-2xl text-foreground font-semibold mb-2">
              Decentralized Freelance Platform
            </p>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Built on Stellar Blockchain
            </p>
          </div>
          <Card className="shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <WalletConnect
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                isConnected={isConnected}
                address={address}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    TrustWork
                  </h1>
                  <span className="text-xs text-muted-foreground">
                    Stellar Freelance Platform
                  </span>
                </div>
              </div>
            </div>
            <WalletConnect
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              isConnected={isConnected}
              address={address}
            />
          </div>
        </div>
      </header>

      <nav className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <Button
              variant={activeTab === "jobs" ? "default" : "ghost"}
              onClick={() => setActiveTab("jobs")}
              className="rounded-b-none relative group"
            >
              <ListTodo className="h-4 w-4 mr-2" />
              Job Board
              {activeTab === "jobs" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              )}
            </Button>
            <Button
              variant={activeTab === "post" ? "default" : "ghost"}
              onClick={() => setActiveTab("post")}
              className="rounded-b-none relative group"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Post Job
              {activeTab === "post" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              )}
            </Button>
            <Button
              variant={activeTab === "escrow" ? "default" : "ghost"}
              onClick={() => setActiveTab("escrow")}
              className="rounded-b-none relative group"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              My Escrows
              {activeTab === "escrow" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              )}
            </Button>
            <Button
              variant={activeTab === "arbitration" ? "default" : "ghost"}
              onClick={() => setActiveTab("arbitration")}
              className="rounded-b-none relative group"
            >
              <Scale className="h-4 w-4 mr-2" />
              Arbitration
              {activeTab === "arbitration" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              )}
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="animate-in fade-in-50 duration-500">
          {activeTab === "jobs" && <JobBoard address={address} />}
          {activeTab === "post" && <PostJob address={address} />}
          {activeTab === "escrow" && (
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">My Escrows</CardTitle>
                    <CardDescription>
                      Manage your escrow contracts and milestones
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">
                    Escrow management interface coming soon...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Track your active contracts and milestones
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "arbitration" && (
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Scale className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Arbitration</CardTitle>
                    <CardDescription>
                      Participate in dispute resolution
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scale className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">
                    Arbitration interface coming soon...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Fair and transparent dispute resolution
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
