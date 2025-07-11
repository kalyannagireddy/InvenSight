import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  CheckCircle
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

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');

      if (error) throw error;

      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories(['all', ...categoryNames]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in-stock":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "low-stock":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "out-of-stock":
        return <Package className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "in-stock": "bg-success/10 text-success border-success/20",
      "low-stock": "bg-warning/10 text-warning border-warning/20",
      "out-of-stock": "bg-destructive/10 text-destructive border-destructive/20"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {getStatusIcon(status)}
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product Management</h1>
          <p className="text-muted-foreground">Manage your inventory and product details</p>
        </div>
        <Button variant="premium" className="animate-scale-in">
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-6 bg-gradient-card hover:shadow-elevated transition-all duration-200">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">#{product.barcode}</p>
                </div>
                {getStatusBadge(product.status)}
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className={`font-medium ${
                    product.quantity === 0 ? "text-destructive" :
                    product.quantity <= 5 ? "text-warning" : "text-success"
                  }`}>
                    {product.quantity} units
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cost Price:</span>
                  <span className="font-medium">${product.cost_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selling Price:</span>
                  <span className="font-medium text-success">${product.selling_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profit Margin:</span>
                  <span className="font-medium text-primary">
                    {(((product.selling_price - product.cost_price) / product.cost_price) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== "all" 
              ? "Try adjusting your search criteria" 
              : "Get started by adding your first product"
            }
          </p>
          <Button variant="default">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ProductManagement;