import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, Package, TrendingDown, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  quantity: number;
  status: string;
  barcode: string;
}

interface Alert {
  id: string;
  type: 'low-stock' | 'out-of-stock';
  product: Product;
  severity: 'high' | 'medium' | 'low';
}

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, quantity, status, barcode')
        .or('status.eq.low-stock,status.eq.out-of-stock')
        .order('quantity', { ascending: true });

      if (error) throw error;

      const alertsData: Alert[] = (products || []).map(product => ({
        id: product.id,
        type: product.status === 'out-of-stock' ? 'out-of-stock' : 'low-stock',
        product,
        severity: product.quantity === 0 ? 'high' : product.quantity <= 5 ? 'medium' : 'low'
      }));

      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: string, severity: string) => {
    if (type === 'out-of-stock') {
      return <X className="h-5 w-5 text-destructive" />;
    }
    return <AlertTriangle className={`h-5 w-5 ${severity === 'high' ? 'text-destructive' : 'text-warning'}`} />;
  };

  const getAlertBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'Critical';
      case 'medium': return 'Warning';
      default: return 'Info';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts & Notifications</h1>
          <p className="text-muted-foreground">Monitor stock levels and system alerts</p>
        </div>
        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
          {alerts.length} Active Alerts
        </Badge>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Out of Stock</h3>
              <p className="text-2xl font-bold text-destructive">
                {alerts.filter(a => a.type === 'out-of-stock').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Low Stock</h3>
              <p className="text-2xl font-bold text-warning">
                {alerts.filter(a => a.type === 'low-stock').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Total Products</h3>
              <p className="text-2xl font-bold text-success">
                {alerts.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Alerts</h2>
        
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
            <p className="text-muted-foreground">No active alerts at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getAlertIcon(alert.type, alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{alert.product.name}</h3>
                      <Badge className={getAlertBadgeVariant(alert.severity)}>
                        {getSeverityText(alert.severity)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.type === 'out-of-stock' 
                        ? 'Product is completely out of stock' 
                        : `Only ${alert.product.quantity} units remaining`}
                    </p>
                    <p className="text-xs text-muted-foreground">Barcode: {alert.product.barcode}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">{alert.product.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AlertsPage;