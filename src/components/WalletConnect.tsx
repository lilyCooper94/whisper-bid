import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Copy } from "lucide-react";
import { useAccount, useDisconnect } from 'wagmi';
import { useToast } from "@/hooks/use-toast";

export const WalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3">
        <Badge variant="secondary" className="hidden sm:flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          className="text-sm"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    className="text-sm"
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="hidden sm:flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-mono">
                      {account.displayName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openAccountModal}
                    className="text-sm"
                  >
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};