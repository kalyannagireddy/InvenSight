import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import ProductManagement from "@/components/products/ProductManagement";
import PointOfSale from "@/components/pos/PointOfSale";
import AlertsPage from "@/components/alerts/AlertsPage";
import ReportsPage from "@/components/reports/ReportsPage";
import SuppliersPage from "@/components/suppliers/SuppliersPage";
import StockPage from "@/components/stock/StockPage";
import SettingsPage from "@/components/settings/SettingsPage";

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
        return <StockPage />;
      case "alerts":
        return <AlertsPage />;
      case "reports":
        return <ReportsPage />;
      case "suppliers":
        return <SuppliersPage />;
      case "settings":
        return <SettingsPage />;
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
