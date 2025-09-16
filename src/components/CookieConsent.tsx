import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after 2 seconds to not overwhelm new visitors
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    
    // Enable analytics or other tracking here
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted'
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
      <div className="flex items-start gap-3">
        <Cookie className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Cookies</h3>
          <p className="text-sm text-gray-600 mb-3">
            Usamos cookies para melhorar sua experiência e analisar o uso do site. 
            Seus dados são protegidos e não compartilhamos informações pessoais.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleAccept}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Aceitar
            </Button>
            <Button 
              onClick={handleDecline}
              variant="outline"
              size="sm"
              className="text-gray-600"
            >
              Recusar
            </Button>
          </div>
        </div>
        <Button
          onClick={handleDecline}
          variant="ghost"
          size="sm"
          className="p-1 h-auto text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;