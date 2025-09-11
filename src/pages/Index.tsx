import { Header } from "@/components/Header";
import { PropertyMarketplace } from "@/components/PropertyMarketplace";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PropertyMarketplace />
      </main>
    </div>
  );
};

export default Index;