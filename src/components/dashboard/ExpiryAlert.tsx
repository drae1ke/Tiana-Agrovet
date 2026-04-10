import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO, format } from 'date-fns';

const ExpiryAlert: React.FC = () => {
  const { t, language } = useLanguage();
  const { data: productsData } = useProducts({ limit: 200 });
  const products = productsData?.data || [];
  const today = new Date();
  
  const expiringProducts = products
    .filter(p => p.expiryDate)
    .map(p => ({
      ...p,
      daysUntilExpiry: differenceInDays(parseISO(p.expiryDate!), today),
    }))
    .filter(p => p.daysUntilExpiry <= 30 && p.daysUntilExpiry >= 0)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  const getExpiryBadge = (days: number) => {
    if (days <= 7) {
      return <Badge variant="destructive">{days} days</Badge>;
    } else if (days <= 14) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">{days} days</Badge>;
    } else {
      return <Badge variant="secondary">{days} days</Badge>;
    }
  };

  if (expiringProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-destructive">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-destructive" />
          {t('expiryAlert')}
        </CardTitle>
        <Badge variant="secondary">{expiringProducts.length} {t('items')}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expiringProducts.slice(0, 5).map((product) => (
            <div key={product._id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">
                  {language === 'sw' ? product.nameSwahili : product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('expiryDate')}: {format(parseISO(product.expiryDate!), 'dd/MM/yyyy')}
                </p>
              </div>
              <div className="text-right">
                {getExpiryBadge(product.daysUntilExpiry)}
              </div>
            </div>
          ))}
        </div>
        {expiringProducts.length > 5 && (
          <Link to="/inventory?filter=expiring">
            <Button variant="ghost" size="sm" className="w-full mt-3">
              {t('view')} {expiringProducts.length - 5} more
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpiryAlert;
