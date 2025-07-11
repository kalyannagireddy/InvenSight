import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  ShoppingCart,
  AlertTriangle,
  Eye
} from "lucide-react";

const Dashboard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [todaysSales, setTodaysSales] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total revenue from all sales
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount');
      
      const revenue = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      setTotalRevenue(revenue);

      // Fetch today's sales
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySalesData } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', today);
      
      const todayRevenue = todaySalesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      setTodaysSales(todayRevenue);

      // Fetch total products
      const { data: productsData } = await supabase
        .from('products')
        .select('id');
      
      setTotalProducts(productsData?.length || 0);

      // Fetch low stock items
      const { data: lowStockData } = await supabase
        .from('products')
        .select('id, name, quantity, categories(name)')
        .lte('quantity', 10)
        .order('quantity', { ascending: true });
      
      setLowStockCount(lowStockData?.length || 0);
      setLowStockItems(lowStockData?.slice(0, 3) || []);

      // Fetch recent sales with product details
      const { data: recentSalesData } = await supabase
        .from('sales')
        .select(`
          id,
          total_amount,
          created_at,
          sale_items(
            quantity,
            products(name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      const formattedSales = recentSalesData?.map(sale => ({
        id: sale.id,
        product: sale.sale_items?.[0]?.products?.name || 'Multiple items',
        customer: 'Customer',
        amount: `$${Number(sale.total_amount).toFixed(2)}`,
        time: new Date(sale.created_at).toLocaleTimeString()
      })) || [];
      
      setRecentSales(formattedSales);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "success"
    },
    {
      title: "Products in Stock",
      value: totalProducts.toString(),
      change: "-2.3%",
      trend: "down",
      icon: Package,
      color: "primary"
    },
    {
      title: "Sales Today",
      value: `$${todaysSales.toFixed(2)}`,
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "success"
    },
    {
      title: "Low Stock Alerts",
      value: lowStockCount.toString(),
      change: "Critical",
      trend: "warning",
      icon: AlertTriangle,
      color: "warning"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>
        <Button variant="premium" className="animate-scale-in">
          <Eye className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 bg-gradient-card hover:shadow-elevated transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-success mr-1" />}
                    {stat.trend === "down" && <TrendingDown className="h-4 w-4 text-destructive mr-1" />}
                    {stat.trend === "warning" && <AlertTriangle className="h-4 w-4 text-warning mr-1" />}
                    <span className={`text-sm font-medium ${
                      stat.trend === "up" ? "text-success" : 
                      stat.trend === "down" ? "text-destructive" : 
                      "text-warning"
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${
                  stat.color === "success" ? "bg-success/10" :
                  stat.color === "primary" ? "bg-primary/10" :
                  "bg-warning/10"
                }`}>
                  <Icon className={`h-6 w-6 ${
                    stat.color === "success" ? "text-success" :
                    stat.color === "primary" ? "text-primary" :
                    "text-warning"
                  }`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Sales</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{sale.product}</p>
                  <p className="text-sm text-muted-foreground">{sale.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{sale.amount}</p>
                  <p className="text-xs text-muted-foreground">{sale.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Low Stock Alerts</h3>
            <Button variant="warning" size="sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Reorder
            </Button>
          </div>
          <div className="space-y-4">
            {lowStockItems.map((item, index) => (
              <div key={index} className="p-3 border border-warning/20 bg-warning/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">
                    {item.categories?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Current: <span className="font-medium text-warning">{item.quantity}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Min: <span className="font-medium">10</span>
                  </span>
                </div>
                <div className="mt-2 w-full bg-muted/50 rounded-full h-2">
                  <div 
                    className="bg-warning h-2 rounded-full"
                    style={{ width: `${(item.quantity / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;