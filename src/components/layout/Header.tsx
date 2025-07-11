import { Package, Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Header = () => {
  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-primary p-2 rounded-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">SmartStock</h1>
            <p className="text-sm text-muted-foreground">Inventory Management System</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-medium">3</span>
            </div>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          
          <Card className="p-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">Admin</p>
                <p className="text-xs text-muted-foreground">Owner</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </header>
  );
};

export default Header;