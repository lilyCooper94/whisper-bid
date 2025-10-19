import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useZamaInstance } from '@/hooks/useZamaInstance';
import { useContract } from '@/hooks/useContract';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Home, Plus, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateAuction() {
  const { address, isConnected } = useAccount();
  const { instance } = useZamaInstance();
  const { createAuction, loading } = useContract();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    reservePrice: '',
    duration: '7'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create an auction",
        variant: "destructive",
      });
      return;
    }

    if (!instance) {
      toast({
        title: "Encryption Service Not Available",
        description: "Please ensure the FHE encryption service is loaded",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🚀 Creating FHE encrypted auction...');
      console.log('📊 Form data:', formData);

      // Convert form data to appropriate types
      const reservePriceWei = Math.floor(parseFloat(formData.reservePrice) * 1000000000000000000000000); // Convert to wei
      const durationSeconds = parseInt(formData.duration) * 24 * 60 * 60; // Convert days to seconds

      console.log('💰 Reserve price in wei:', reservePriceWei);
      console.log('⏰ Duration in seconds:', durationSeconds);

      // Create auction with FHE encryption
      await createAuction(
        formData.title,
        formData.description,
        formData.imageUrl,
        formData.location,
        parseInt(formData.bedrooms),
        parseFloat(formData.bathrooms),
        parseInt(formData.squareFeet),
        reservePriceWei,
        durationSeconds
      );

      toast({
        title: "Auction Created Successfully",
        description: "Your auction has been created with FHE encryption",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        squareFeet: '',
        reservePrice: '',
        duration: '7'
      });

    } catch (error) {
      console.error('Error creating auction:', error);
      toast({
        title: "Auction Creation Failed",
        description: "Failed to create auction. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-8">
            <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Connect Wallet Required</h2>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to create a new auction with FHE encryption.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Create FHE Encrypted Auction
          </h1>
          <p className="text-lg text-muted-foreground">
            Create a new auction with fully homomorphic encryption to protect sensitive data.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Information</h3>
              
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Modern Luxury Villa"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your property..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Beverly Hills, CA"
                  required
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    placeholder="4"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="1"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    placeholder="3"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="squareFeet">Square Feet *</Label>
                  <Input
                    id="squareFeet"
                    type="number"
                    min="1"
                    value={formData.squareFeet}
                    onChange={(e) => handleInputChange('squareFeet', e.target.value)}
                    placeholder="3200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Auction Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Auction Settings</h3>
              
              <div>
                <Label htmlFor="reservePrice">Reserve Price (in millions) *</Label>
                <Input
                  id="reservePrice"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.reservePrice}
                  onChange={(e) => handleInputChange('reservePrice', e.target.value)}
                  placeholder="2.85"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This price will be encrypted using FHE
                </p>
              </div>

              <div>
                <Label htmlFor="duration">Auction Duration *</Label>
                <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button
                type="submit"
                className="w-full bg-gradient-primary text-primary-foreground shadow-card hover:shadow-glow transition-all duration-300"
                disabled={loading || !instance}
              >
                <Lock className="w-4 h-4 mr-2" />
                {loading ? "Creating Encrypted Auction..." : "Create FHE Encrypted Auction"}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-3">
                🔒 Your auction data will be encrypted using Fully Homomorphic Encryption
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
