import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  Edit,
  Trash2,
  Users
} from "lucide-react";

// We'll create a suppliers table in the future, for now showing placeholder data
interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
  products_count: number;
}

const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Global Electronics Supply",
    contact_person: "John Smith",
    email: "john@globalsupply.com",
    phone: "+1-555-0123",
    address: "123 Industrial Ave, New York, NY",
    status: "active",
    products_count: 45
  },
  {
    id: "2",
    name: "Fresh Foods Distributor",
    contact_person: "Sarah Johnson",
    email: "sarah@freshfoods.com",
    phone: "+1-555-0456",
    address: "456 Market St, Los Angeles, CA",
    status: "active",
    products_count: 23
  },
  {
    id: "3",
    name: "Office Supplies Co.",
    contact_person: "Mike Brown",
    email: "mike@officesupplies.com",
    phone: "+1-555-0789",
    address: "789 Business Blvd, Chicago, IL",
    status: "inactive",
    products_count: 12
  }
];

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? "bg-success/10 text-success border-success/20"
      : "bg-muted text-muted-foreground border-muted";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supplier Management</h1>
          <p className="text-muted-foreground">Manage your suppliers and vendor relationships</p>
        </div>
        <Button variant="premium" className="animate-scale-in">
          <Plus className="h-4 w-4 mr-2" />
          Add New Supplier
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
              <p className="text-2xl font-bold text-foreground">{suppliers.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <Users className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Suppliers</p>
              <p className="text-2xl font-bold text-foreground">
                {suppliers.filter(s => s.status === "active").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Users className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Products Supplied</p>
              <p className="text-2xl font-bold text-foreground">
                {suppliers.reduce((sum, s) => sum + s.products_count, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers by name, contact, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Suppliers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="p-6 bg-gradient-card hover:shadow-elevated transition-all duration-200">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{supplier.name}</h3>
                  <p className="text-sm text-muted-foreground">{supplier.contact_person}</p>
                </div>
                <Badge className={getStatusBadge(supplier.status)}>
                  {supplier.status.toUpperCase()}
                </Badge>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{supplier.address}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Products Supplied:</span>
                <span className="font-bold text-primary">{supplier.products_count}</span>
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
      {filteredSuppliers.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No suppliers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? "Try adjusting your search criteria" 
              : "Get started by adding your first supplier"
            }
          </p>
          <Button variant="default">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </Card>
      )}
    </div>
  );
};

export default SuppliersPage;