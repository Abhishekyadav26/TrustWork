"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet, LogOut, ExternalLink, AlertCircle } from "lucide-react";
import { stellar } from "@/lib/stellar-helper";

interface WalletConnectProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  address?: string;
}

export function WalletConnect({
  onConnect,
  onDisconnect,
  isConnected,
  address,
}: WalletConnectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  // Check wallet availability and connection status on mount
  useEffect(() => {
    const checkWallet = async () => {
      try {
        // Check if Freighter is available
        const isAvailable = await stellar.isFreighterAvailable();
        if (!isAvailable) {
          setError(
            "Freighter wallet is not installed. Please install the Freighter browser extension.",
          );
          setIsCheckingWallet(false);
          return;
        }

        // Check if wallet is already connected
        const isConnected = await stellar.isWalletConnected();
        if (isConnected) {
          // If already connected, get the address
          const address = stellar.publicKey;
          if (address) {
            onConnect(address);
            setBalance(null); // Will be fetched by parent
          }
        }

        setIsCheckingWallet(false);
      } catch (error) {
        console.error("Error checking wallet:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred",
        );
        setIsCheckingWallet(false);
      }
    };

    checkWallet();
  }, [onConnect]);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    setBalance(null);

    try {
      // Connect using the new stellar helper
      const publicKey = await stellar.connectWallet();

      onConnect(publicKey);

      // Fetch account balance
      try {
        const balances = await stellar.getAccountBalances(publicKey);
        const xlmBalance = balances.find((b) => b.assetCode === "XLM");
        if (xlmBalance) {
          setBalance(xlmBalance.balance);
        }
      } catch (balanceError) {
        console.error("Failed to fetch balance:", balanceError);
        // Don't fail the connection if balance fetch fails
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsLoading(true);
    setError(null);
    setBalance(null);

    try {
      stellar.disconnect();
      onDisconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    return stellar.shortenAddress(addr);
  };

  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        // You could add a toast notification here
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  };

  // Show wallet checking loader
  if (isCheckingWallet) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Checking Wallet...
          </CardTitle>
          <CardDescription>Verifying wallet availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>Checking for Freighter wallet extension...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isConnected && address) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            Your Stellar wallet is connected via Freighter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-mono">{formatAddress(address)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {balance && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Balance: {balance} XLM
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoading ? "Disconnecting..." : "Disconnect"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your Freighter wallet to use TrustWork on Stellar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <Button onClick={handleConnect} className="w-full" disabled={isLoading}>
          <Wallet className="h-4 w-4 mr-2" />
          {isLoading ? "Connecting..." : "Connect Freighter Wallet"}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Make sure Freighter extension is installed</p>
          <p>• Ensure you&apos;re on Stellar Testnet</p>
          <p>• Have some XLM in your wallet for transactions</p>
        </div>
      </CardContent>
    </Card>
  );
}
