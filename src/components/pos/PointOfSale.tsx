import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { 
  Scan, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign,
  ShoppingCart,
  Calculator
} from "lucide-react";

interface CartItem {
  id: string;
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

const PointOfSale = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [customerMoney, setCustomerMoney] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, barcode, name, selling_price, quantity')
        .gt('quantity', 0);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;
  const change = customerMoney ? Math.max(0, parseFloat(customerMoney) - total) : 0;

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = products.find(p => p.barcode === barcodeInput);
    if (product && product.quantity > 0) {
      addToCart(product.id, barcodeInput, product.name, Number(product.selling_price));
      setBarcodeInput("");
    } else {
      alert("Product not found or out of stock!");
    }
  };

  const addToCart = (productId: string, barcode: string, name: string, price: number) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.barcode === barcode);
      if (existingItem) {
        return prev.map(item =>
          item.barcode === barcode
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      } else {
        return [...prev, {
          id: productId,
          barcode,
          name,
          price,
          quantity: 1,
          total: price
        }];
      }
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(id);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const completeSale = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }
    
    if (!customerMoney || parseFloat(customerMoney) < total) {
      alert("Insufficient payment!");
      return;
    }

    try {
      // Record sale in database
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          total_amount: total,
          customer_payment: parseFloat(customerMoney),
          change_amount: change
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Record sale items
      const saleItems = cartItems.map(item => ({
        sale_id: sale.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.total
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update inventory quantities
      for (const item of cartItems) {
        const { data: product } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', item.id)
          .single();
        
        if (product) {
          await supabase
            .from('products')
            .update({ 
              quantity: product.quantity - item.quantity 
            })
            .eq('id', item.id);
        }
      }

      alert(`Sale completed! Change: $${change.toFixed(2)}`);
      setCartItems([]);
      setCustomerMoney("");
      fetchProducts(); // Refresh product list
    } catch (error) {
      console.error('Error completing sale:', error);
      alert('Error completing sale. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Left Column - Product Scanner & Cart */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Point of Sale</h1>
          <p className="text-muted-foreground">Scan products and process sales</p>
        </div>

        {/* Barcode Scanner */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Product Scanner</h3>
          <form onSubmit={handleBarcodeSubmit} className="flex gap-4">
            <div className="flex-1 relative">
              <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Scan or enter barcode..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <Button type="submit" variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </form>
        </Card>

        {/* Shopping Cart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Shopping Cart</h3>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="font-medium">{cartItems.length} items</span>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Cart is empty</p>
              <p className="text-sm text-muted-foreground">Scan a product to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">#{item.barcode}</p>
                    <p className="text-sm font-medium text-primary">${item.price.toFixed(2)} each</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 ml-2"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="font-semibold text-foreground">${item.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Right Column - Payment */}
      <div className="space-y-6">
        {/* Order Summary */}
        <Card className="p-6 bg-gradient-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (8%):</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Total:</span>
                <span className="font-bold text-lg text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Customer Payment
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={customerMoney}
                  onChange={(e) => setCustomerMoney(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {customerMoney && parseFloat(customerMoney) >= total && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-success font-medium">Change:</span>
                  <span className="text-success font-bold">${change.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button 
                variant="premium" 
                className="w-full h-12"
                onClick={completeSale}
                disabled={cartItems.length === 0}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Complete Sale
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const result = prompt("Enter calculation (e.g., 25.50 + 12.75):");
                    if (result) {
                      try {
                        const calculated = eval(result);
                        if (typeof calculated === 'number' && !isNaN(calculated)) {
                          setCustomerMoney(calculated.toFixed(2));
                        }
                      } catch (e) {
                        alert("Invalid calculation");
                      }
                    }
                  }}
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  Calculator
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCartItems([])}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Add Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Add</h3>
          <div className="grid grid-cols-1 gap-2">
            {products.slice(0, 5).map((product) => (
              <Button
                key={product.id}
                variant="outline"
                className="justify-start text-left h-auto p-3"
                onClick={() => addToCart(product.id, product.barcode, product.name, Number(product.selling_price))}
              >
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">${Number(product.selling_price).toFixed(2)}</p>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PointOfSale;