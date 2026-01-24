import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getProducts } from '@/utils/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LowStockAlert: React.FC = () => {
  const { t, language } = useLanguage();
  const products = getProducts();
  
  const lowStockProducts = products.filter(p => p.quantity <= p.minStockLevel);

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          {t('lowStockAlert')}
        </CardTitle>
        <Badge variant="secondary">{lowStockProducts.length} {t('items')}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockProducts.slice(0, 5).map((product) => (
            <div key={product.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">
                  {language === 'sw' ? product.nameSwahili : product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  SKU: {product.sku}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="destructive" className="mb-1">
                  {product.quantity} / {product.minStockLevel}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        {lowStockProducts.length > 5 && (
          <Link to="/inventory?filter=low-stock">
            <Button variant="ghost" size="sm" className="w-full mt-3">
              {t('view')} {lowStockProducts.length - 5} more
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
