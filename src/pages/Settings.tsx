import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSettings, saveSettings, exportAllData, importAllData } from '@/utils/storage';
import { AppSettings } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Settings as SettingsIcon,
  Globe,
  Bell,
  Database,
  Download,
  Upload,
  Save
} from 'lucide-react';

const Settings: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setLanguage(settings.language);
    setHasChanges(false);
    toast.success(language === 'sw' ? 'Mipangilio imehifadhiwa' : 'Settings saved');
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrovet-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success(language === 'sw' ? 'Data imehamishwa' : 'Data exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      const success = importAllData(data);
      if (success) {
        toast.success(language === 'sw' ? 'Data imerejeshwa' : 'Data restored');
        window.location.reload();
      } else {
        toast.error(language === 'sw' ? 'Hitilafu wakati wa kurejesha' : 'Error restoring data');
      }
    };
    reader.readAsText(file);
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            {t('settings')}
          </CardTitle>
          <CardDescription>
            {language === 'sw' 
              ? 'Simamia mipangilio ya mfumo wako' 
              : 'Manage your system preferences'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">{t('language')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={settings.language === 'en' ? 'default' : 'outline'}
                className="h-16"
                onClick={() => updateSetting('language', 'en')}
              >
                <div className="text-center">
                  <p className="font-medium">{t('english')}</p>
                  <p className="text-xs opacity-70">English</p>
                </div>
              </Button>
              <Button
                variant={settings.language === 'sw' ? 'default' : 'outline'}
                className="h-16"
                onClick={() => updateSetting('language', 'sw')}
              >
                <div className="text-center">
                  <p className="font-medium">{t('swahili')}</p>
                  <p className="text-xs opacity-70">Kiswahili</p>
                </div>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Notification Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">{t('notifications')}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoOrder">{t('enableAutoOrder')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sw' 
                      ? 'Unda maagizo kiotomatiki kwa bidhaa chache'
                      : 'Automatically create orders for low stock items'
                    }
                  </p>
                </div>
                <Switch
                  id="autoOrder"
                  checked={settings.autoOrderEnabled}
                  onCheckedChange={(checked) => updateSetting('autoOrderEnabled', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lowStock">{t('lowStockThreshold')}</Label>
                  <Input
                    id="lowStock"
                    type="number"
                    min="1"
                    value={settings.lowStockThreshold}
                    onChange={(e) => updateSetting('lowStockThreshold', parseInt(e.target.value) || 10)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDays">{t('expiryWarningDays')}</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    min="1"
                    value={settings.expiryWarningDays}
                    onChange={(e) => updateSetting('expiryWarningDays', parseInt(e.target.value) || 30)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">
                {language === 'sw' ? 'Usimamizi wa Data' : 'Data Management'}
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                {t('backupData')}
              </Button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => document.getElementById('import-file')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t('restoreData')}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'sw' 
                ? 'Hifadhi nakala za data yako kwa usalama'
                : 'Keep backups of your data for safety'
              }
            </p>
          </div>

          {hasChanges && (
            <>
              <Separator />
              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {t('saveSettings')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
