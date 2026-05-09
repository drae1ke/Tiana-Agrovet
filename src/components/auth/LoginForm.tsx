import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Leaf, Globe, AlertCircle, Loader2 } from 'lucide-react';

type LoginErrorKey = 'loginError' | 'loginUnavailable';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorKey, setErrorKey] = useState<LoginErrorKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';
  const hasError = Boolean(errorKey);
  const errorId = 'login-error';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);
    setIsSubmitting(true);

    try {
      const result = await login(username.trim(), password);

      if (result.success) {
        navigate(from, { replace: true });
        return;
      }

      setErrorKey(
        result.reason === 'invalid_credentials' ? 'loginError' : 'loginUnavailable'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setErrorKey(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrorKey(null);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'Kiswahili' : 'English'}
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t('agrovetSystem')}</CardTitle>
            <CardDescription>
              {language === 'en' 
                ? 'Enter your credentials to access the system' 
                : 'Ingiza taarifa zako kuingia kwenye mfumo'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isSubmitting}>
              {errorKey && (
                <Alert id={errorId} variant="destructive" aria-live="assertive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{t(errorKey)}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">{t('username')}</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder={language === 'en' ? 'Enter username' : 'Ingiza jina'}
                  required
                  disabled={isSubmitting}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? errorId : undefined}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder={language === 'en' ? 'Enter password' : 'Ingiza neno la siri'}
                  required
                  disabled={isSubmitting}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? errorId : undefined}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting} aria-live="polite">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isSubmitting ? t('loginLoading') : t('login')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
