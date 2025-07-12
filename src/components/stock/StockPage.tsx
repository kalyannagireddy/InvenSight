import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Edit,
  Plus,
  Minus,
  Search,
  Filter
} from "lucide-react";

interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

interface StockMovement {
  id: string;
  product_name: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  created_at: string;
}

const StockPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchStockMovements();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          barcode,
          name,
          quantity,
          cost_price,
          selling_price,
          status,
          categories(name)
        `)
        .order('name');

      if (error) throw error;

      const formattedProducts = data?.map(product => ({
        id: product.id,
        barcode: product.barcode,
        name: product.name,
        category: product.categories?.name || 'Uncategorized',
        quantity: product.quantity,
        cost_price: Number(product.cost_price),
        selling_price: Number(product.selling_price),
        status: product.status as "in-stock" | "low-stock" | "out-of-stock"
      })) || [];

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockMovements = () => {
    // Mock data for stock movements - in a real app, this would come from a stock_movements table
    const mockMovements: StockMovement[] = [
      {
        id: "1",
        product_name: "Wireless Bluetooth Headphones",
        type: "in",
        quantity: 50,
        reason: "New stock delivery",
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        product_name: "Gaming Mouse",
        type: "out",
        quantity: -5,
        reason: "Sales",
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "3",
        product_name: "USB-C Cable",
        type: "adjustment",
        quantity: -2,
        reason: "Inventory correction",
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    setStockMovements(mockMovements);
  };

  const updateStock = async (productId: string, newQuantity: number, reason: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Stock updated successfully",
        description: `Stock has been updated. Reason: ${reason}`,
      });

      fetchProducts();
      setSelectedProduct(null);
      setAdjustmentQuantity("");
      setAdjustmentReason("");
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStockAdjustment = (product: Product) => {
    if (!adjustmentQuantity || !adjustmentReason) {
      toast({
        title: "Error",
        description: "Please enter both quantity and reason for adjustment.",
        variant: "destructive",
      });
      return;
    }

    const adjustment = parseInt(adjustmentQuantity);
    const newQuantity = Math.max(0, product.quantity + adjustment);
    updateStock(product.id, newQuantity, adjustmentReason);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      "in-stock": "bg-success/10 text-success border-success/20",
      "low-stock": "bg-warning/10 text-warning border-warning/20",
      "out-of-stock": "bg-destructive/10 text-destructive border-destructive/20"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    );
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'out': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <RefreshCw className="h-4 w-4 text-warning" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Management</h1>
          <p className="text-muted-foreground">Monitor and update your inventory levels</p>
        </div>
        <Button variant="outline" onClick={fetchProducts}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stock Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-foreground">{products.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Stock</p>
              <p className="text-2xl font-bold text-foreground">
                {products.filter(p => p.status === "in-stock").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/10 rounded-lg">
              <TrendingDown className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-foreground">
                {products.filter(p => p.status === "low-stock").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <Package className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-foreground">
                {products.filter(p => p.status === "out-of-stock").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Levels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Products List */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Current Stock Levels</h3>
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-foreground">{product.name}</h4>
                      {getStatusBadge(product.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product.category} • Barcode: {product.barcode}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{product.quantity}</p>
                      <p className="text-sm text-muted-foreground">units</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Adjust
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Stock Adjustment */}
          {selectedProduct && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Adjust Stock</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-foreground">{selectedProduct.name}</p>
                  <p className="text-sm text-muted-foreground">Current: {selectedProduct.quantity} units</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Adjustment (+/-)</label>
                  <Input
                    type="number"
                    placeholder="e.g., +10 or -5"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Reason</label>
                  <Input
                    placeholder="e.g., New delivery, damaged items"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStockAdjustment(selectedProduct)}
                    className="flex-1"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Movements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Movements</h3>
            <div className="space-y-3">
              {stockMovements.map((movement) => (
                <div key={movement.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  {getMovementIcon(movement.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{movement.product_name}</p>
                    <p className="text-xs text-muted-foreground">{movement.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      movement.quantity > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(movement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StockPage;