import { Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "./WalletConnect";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Home className="h-8 w-8 text-accent" />
              <Shield className="absolute -bottom-1 -right-1 h-4 w-4 text-gold" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Whisper Bid
              </h1>
              <p className="text-xs text-muted-foreground">Private Real Estate Marketplace</p>
            </div>
          </div>
        </Link>

                <nav className="hidden md:flex items-center space-x-6">
                  <Link to="/">
                    <Button 
                      variant={location.pathname === "/" ? "default" : "ghost"} 
                      className="text-sm font-medium"
                    >
                      Marketplace
                    </Button>
                  </Link>
                  <Link to="/create">
                    <Button 
                      variant={location.pathname === "/create" ? "default" : "ghost"} 
                      className="text-sm font-medium"
                    >
                      Create Auction
                    </Button>
                  </Link>
                  <Link to="/my-bids">
                    <Button 
                      variant={location.pathname === "/my-bids" ? "default" : "ghost"} 
                      className="text-sm font-medium"
                    >
                      My Bids
                    </Button>
                  </Link>
                  <Button variant="ghost" className="text-sm font-medium">
                    How It Works
                  </Button>
                </nav>

        <WalletConnect />
      </div>
    </header>
  );
};