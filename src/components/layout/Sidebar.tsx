import { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  BarChart3,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface NavItem {
  icon: any;
  label: string;
  id: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Package, label: "Products", id: "products" },
  { icon: ShoppingCart, label: "Point of Sale", id: "pos" },
  { icon: TrendingUp, label: "Stock Updates", id: "stock" },
  { icon: AlertTriangle, label: "Alerts", id: "alerts", badge: 3 },
  { icon: BarChart3, label: "Reports", id: "reports" },
  { icon: Users, label: "Suppliers", id: "suppliers" },
  { icon: Settings, label: "Settings", id: "settings" },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  return (
    <aside className="w-64 bg-background border-r border-border h-full">
      <div className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-11 ${
                isActive ? "shadow-sm" : ""
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <div className="bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                  {item.badge}
                </div>
              )}
            </Button>
          );
        })}
      </div>
      
      {/* Quick Stats Card */}
      <div className="p-4">
        <Card className="p-4 bg-gradient-card">
          <h3 className="font-medium text-sm text-foreground mb-3">Today's Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sales</span>
              <span className="font-medium text-success">$1,247</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items Sold</span>
              <span className="font-medium">34</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Low Stock</span>
              <span className="font-medium text-warning">3 items</span>
            </div>
          </div>
        </Card>
      </div>
    </aside>
  );
};

export default Sidebar;