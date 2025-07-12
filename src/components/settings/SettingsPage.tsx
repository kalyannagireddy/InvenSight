import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Store, 
  Bell, 
  Shield, 
  Palette,
  Database,
  Download,
  Upload,
  Save
} from "lucide-react";

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [storeSettings, setStoreSettings] = useState({
    storeName: "RetailFlow Store",
    storeAddress: "123 Main Street, City, State",
    contactEmail: "admin@retailflow.com",
    contactPhone: "+1-555-0123",
    currency: "USD",
    taxRate: "8.5"
  });

  const [notificationSettings, setNotificationSettings] = useState({
    lowStockAlerts: true,
    outOfStockAlerts: true,
    salesNotifications: false,
    emailReports: true,
    smsAlerts: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    autoLogout: true,
    auditLogs: true
  });

  const [displaySettings, setDisplaySettings] = useState({
    darkMode: false,
    compactView: false,
    showProductImages: true,
    itemsPerPage: "20"
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved successfully",
        description: "Your settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export initiated",
      description: "Your data export will be ready shortly.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import feature",
      description: "Data import functionality will be available soon.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your application preferences and configuration</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading} variant="premium">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Store Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, storeName: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storeAddress">Address</Label>
              <Input
                id="storeAddress"
                value={storeSettings.storeAddress}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, storeAddress: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={storeSettings.contactEmail}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={storeSettings.contactPhone}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={storeSettings.currency}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, currency: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.1"
                  value={storeSettings.taxRate}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, taxRate: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Bell className="h-5 w-5 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
              </div>
              <Switch
                checked={notificationSettings.lowStockAlerts}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, lowStockAlerts: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Out of Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when products are out of stock</p>
              </div>
              <Switch
                checked={notificationSettings.outOfStockAlerts}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, outOfStockAlerts: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Sales Notifications</p>
                <p className="text-sm text-muted-foreground">Real-time notifications for new sales</p>
              </div>
              <Switch
                checked={notificationSettings.salesNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, salesNotifications: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Reports</p>
                <p className="text-sm text-muted-foreground">Daily and weekly email reports</p>
              </div>
              <Switch
                checked={notificationSettings.emailReports}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailReports: checked }))}
              />
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Security</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch
                checked={securitySettings.twoFactorAuth}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Auto Logout</p>
                <p className="text-sm text-muted-foreground">Automatically logout after inactivity</p>
              </div>
              <Switch
                checked={securitySettings.autoLogout}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, autoLogout: checked }))}
              />
            </div>
          </div>
        </Card>

        {/* Display Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-success/10 rounded-lg">
              <Palette className="h-5 w-5 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Display</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Switch to dark theme</p>
              </div>
              <Switch
                checked={displaySettings.darkMode}
                onCheckedChange={(checked) => setDisplaySettings(prev => ({ ...prev, darkMode: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Compact View</p>
                <p className="text-sm text-muted-foreground">Show more items in less space</p>
              </div>
              <Switch
                checked={displaySettings.compactView}
                onCheckedChange={(checked) => setDisplaySettings(prev => ({ ...prev, compactView: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="itemsPerPage">Items Per Page</Label>
              <Input
                id="itemsPerPage"
                type="number"
                value={displaySettings.itemsPerPage}
                onChange={(e) => setDisplaySettings(prev => ({ ...prev, itemsPerPage: e.target.value }))}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Data Management */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent rounded-lg">
            <Database className="h-5 w-5 text-accent-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleExportData} className="justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          
          <Button variant="outline" onClick={handleImportData} className="justify-start">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Data export includes all products, sales, and categories. 
            Import functionality supports CSV and JSON formats.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;