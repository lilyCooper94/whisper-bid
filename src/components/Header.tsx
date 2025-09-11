import { Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "./WalletConnect";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Home className="h-8 w-8 text-accent" />
              <Shield className="absolute -bottom-1 -right-1 h-4 w-4 text-gold" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                FHE Protected Bidding
              </h1>
              <p className="text-xs text-muted-foreground">Private Real Estate Marketplace</p>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" className="text-sm font-medium">
            Marketplace
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            My Bids
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            How It Works
          </Button>
        </nav>

        <WalletConnect />
      </div>
    </header>
  );
};