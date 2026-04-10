import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Supplier } from '@/types';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Users,
  Phone,
  Mail,
  MapPin,
  Shield,
  Zap
} from 'lucide-react';

const Suppliers: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Supplier | null>(null);

  const { data: suppliersData, isLoading } = useSuppliers({ limit: 200 });
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  // Ensure suppliers is always an array
  const suppliers = suppliersData?.data || [];

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    isTrusted: false,
    autoOrderEnabled: false,
  });

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      isTrusted: false,
      autoOrderEnabled: false,
    });
    setShowModal(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({ ...supplier });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error(language === 'sw' ? 'Jaza taarifa zote' : 'Fill all required fields');
      return;
    }

    if (editingSupplier) {
      updateSupplierMutation.mutate(
        {
          id: editingSupplier._id,
          payload: {
            name: formData.name!,
            phone: formData.phone!,
            email: formData.email || '',
            address: formData.address || '',
            isTrusted: formData.isTrusted || false,
            autoOrderEnabled: formData.autoOrderEnabled || false,
          }
        },
        {
          onSuccess: () => {
            setShowModal(false);
            setEditingSupplier(null);
            setFormData({
              name: '',
              phone: '',
              email: '',
              address: '',
              isTrusted: false,
              autoOrderEnabled: false,
            });
          }
        }
      );
    } else {
      createSupplierMutation.mutate(
        {
          name: formData.name!,
          phone: formData.phone!,
          email: formData.email || '',
          address: formData.address || '',
          isTrusted: formData.isTrusted || false,
          autoOrderEnabled: formData.autoOrderEnabled || false,
        },
        {
          onSuccess: () => {
            setShowModal(false);
            setFormData({
              name: '',
              phone: '',
              email: '',
              address: '',
              isTrusted: false,
              autoOrderEnabled: false,
            });
          }
        }
      );
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteSupplierMutation.mutate(showDeleteConfirm._id, {
        onSuccess: () => {
          setShowDeleteConfirm(null);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('suppliers')}
          </CardTitle>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addSupplier')}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`${t('search')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Suppliers Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('supplierName')}</TableHead>
                  <TableHead>{t('phone')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('address')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier._id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {supplier.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {supplier.email || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {supplier.address || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {supplier.isTrusted && (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            {language === 'sw' ? 'Anayeaminika' : 'Trusted'}
                          </Badge>
                        )}
                        {supplier.autoOrderEnabled && (
                          <Badge className="gap-1 bg-green-500 hover:bg-green-600">
                            <Zap className="h-3 w-3" />
                            {t('autoOrder')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setShowDeleteConfirm(supplier)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSuppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('noResults')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? t('editSupplier') : t('addSupplier')}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('supplierName')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')} *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+254..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="trusted">{t('trustedSupplier')}</Label>
              <Switch
                id="trusted"
                checked={formData.isTrusted}
                onCheckedChange={(checked) => setFormData({ ...formData, isTrusted: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoOrder">{t('enableAutoOrder')}</Label>
              <Switch
                id="autoOrder"
                checked={formData.autoOrderEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, autoOrderEnabled: checked })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit">
                {t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteSupplier')}</DialogTitle>
            <DialogDescription>
              {language === 'sw' 
                ? `Una uhakika unataka kufuta "${showDeleteConfirm?.name}"?`
                : `Are you sure you want to delete "${showDeleteConfirm?.name}"?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;
