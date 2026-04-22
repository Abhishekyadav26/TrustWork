"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import { stellar } from "@/lib/stellar-helper";

interface WalletConnectProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  address?: string;
  className?: string;
}

export function WalletConnect({
  onConnect,
  onDisconnect,
  isConnected,
  address,
  className = "",
}: WalletConnectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);

  // Check wallet availability and connection status on mount
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const isAvailable = await stellar.isFreighterAvailable();
        if (!isAvailable) {
          setIsCheckingWallet(false);
          return;
        }

        const connected = await stellar.isWalletConnected();
        if (connected) {
          const addr = stellar.publicKey;
          if (addr) {
            onConnect(addr);
          }
        }
        setIsCheckingWallet(false);
      } catch (error) {
        console.error("Error checking wallet:", error);
        setIsCheckingWallet(false);
      }
    };

    checkWallet();
  }, [onConnect]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const publicKey = await stellar.connectWallet();
      onConnect(publicKey);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsLoading(true);
    try {
      stellar.disconnect();
      onDisconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    return stellar.shortenAddress(addr);
  };

  if (isCheckingWallet) {
    return (
      <Button disabled className={className} variant="outline">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <Button
        onClick={handleDisconnect}
        variant="secondary"
        className={`group relative ${className}`}
        disabled={isLoading}
      >
        <span className="flex items-center group-hover:opacity-0 transition-opacity">
          <Wallet className="h-4 w-4 mr-2 text-blue-400" />
          {formatAddress(address)}
        </span>
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <LogOut className="h-4 w-4 mr-2 text-red-400" />
          Disconnect
        </span>
      </Button>
    );
  }

  return (
    <Button onClick={handleConnect} className={className} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Wallet className="h-4 w-4 mr-2" />
      )}
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
