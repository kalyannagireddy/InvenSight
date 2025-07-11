import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import ProductManagement from "@/components/products/ProductManagement";
import PointOfSale from "@/components/pos/PointOfSale";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <ProductManagement />;
      case "pos":
        return <PointOfSale />;
      case "stock":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Stock Updates</h2>
            <p className="text-muted-foreground">Feature coming soon...</p>
          </div>
        );
      case "alerts":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Alerts & Notifications</h2>
            <p className="text-muted-foreground">Feature coming soon...</p>
          </div>
        );
      case "reports":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Reports & Analytics</h2>
            <p className="text-muted-foreground">Feature coming soon...</p>
          </div>
        );
      case "suppliers":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Supplier Management</h2>
            <p className="text-muted-foreground">Feature coming soon...</p>
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Feature coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      <Header />
      
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
