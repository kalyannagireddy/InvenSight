import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package,
  Calendar,
  Download
} from "lucide-react";

interface SalesData {
  total_sales: number;
  total_items_sold: number;
  total_revenue: number;
  average_sale: number;
}

interface TopProduct {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

const ReportsPage = () => {
  const [salesData, setSalesData] = useState<SalesData>({
    total_sales: 0,
    total_items_sold: 0,
    total_revenue: 0,
    average_sale: 0
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      
      // Get sales data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('total_amount, created_at');

      if (salesError) throw salesError;

      // Get sale items with products
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          total_price,
          products(name)
        `);

      if (itemsError) throw itemsError;

      // Calculate metrics
      const totalSales = sales?.length || 0;
      const totalRevenue = sales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      const totalItemsSold = saleItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

      setSalesData({
        total_sales: totalSales,
        total_items_sold: totalItemsSold,
        total_revenue: totalRevenue,
        average_sale: averageSale
      });

      // Calculate top products
      const productSales: Record<string, { quantity: number; revenue: number }> = {};
      
      saleItems?.forEach(item => {
        const productName = item.products?.name || 'Unknown Product';
        if (!productSales[productName]) {
          productSales[productName] = { quantity: 0, revenue: 0 };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += Number(item.total_price);
      });

      const topProductsArray = Object.entries(productSales)
        .map(([name, data]) => ({
          product_name: name,
          total_quantity: data.quantity,
          total_revenue: data.revenue
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);

      setTopProducts(topProductsArray);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Track your business performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold text-foreground">{salesData.total_sales}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${salesData.total_revenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Package className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Items Sold</p>
              <p className="text-2xl font-bold text-foreground">{salesData.total_items_sold}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent rounded-lg">
              <TrendingUp className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Sale</p>
              <p className="text-2xl font-bold text-foreground">${salesData.average_sale.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Top Products</h3>
            <Badge variant="outline">By Revenue</Badge>
          </div>
          
          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sales data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.product_name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.product_name}</p>
                      <p className="text-sm text-muted-foreground">{product.total_quantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">${product.total_revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Performance Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Performance Summary</h3>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Revenue Target</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Sales Target</span>
                <span className="text-sm font-medium">60%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                <span className="text-sm font-medium">90%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;