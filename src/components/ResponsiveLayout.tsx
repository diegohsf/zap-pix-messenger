import React from 'react';
import MobileHero from './MobileHero';
import MobileTrustIndicators from './MobileTrustIndicators';
import MobileOptimizedForm from './MobileOptimizedForm';

// Lazy load heavy components for mobile performance
const RecentMessages = React.lazy(() => import('./RecentMessages'));

// Simple mobile detection hook
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

interface ResponsiveLayoutProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ onSubmit, isSubmitting }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHero />
        <MobileTrustIndicators />
        <MobileOptimizedForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
        
        {/* Mobile FAQ - Compact */}
        <div className="mt-8 px-4">
          <h3 className="text-lg font-bold text-center text-gray-900 mb-4">
            ❓ Perguntas Frequentes
          </h3>
          <div className="space-y-3 text-sm">
            <details className="bg-white p-3 rounded-lg border">
              <summary className="font-medium text-gray-900 cursor-pointer">
                É realmente anônimo?
              </summary>
              <p className="text-gray-600 mt-2 text-xs">
                Sim! Não armazenamos nenhuma informação que possa identificá-lo. Seu IP é mascarado e não mantemos logs.
              </p>
            </details>
            
            <details className="bg-white p-3 rounded-lg border">
              <summary className="font-medium text-gray-900 cursor-pointer">
                Quanto tempo para entregar?
              </summary>
              <p className="text-gray-600 mt-2 text-xs">
                Após o pagamento confirmado, a mensagem é entregue em menos de 10 segundos.
              </p>
            </details>
            
            <details className="bg-white p-3 rounded-lg border">
              <summary className="font-medium text-gray-900 cursor-pointer">
                Posso enviar fotos e vídeos?
              </summary>
              <p className="text-gray-600 mt-2 text-xs">
                Sim! Suportamos fotos (até 10MB), vídeos (até 50MB) e áudios (até 5MB).
              </p>
            </details>
          </div>
        </div>

        {/* Mobile Recent Messages - Compact */}
        <div className="mt-6 px-4 pb-8">
          <React.Suspense fallback={<div className="text-center py-4">Carregando mensagens...</div>}>
            <RecentMessages />
          </React.Suspense>
        </div>
      </div>
    );
  }

  // Desktop version - import original components
  const MessageForm = React.lazy(() => import('./MessageForm'));
  
  return (
    <React.Suspense fallback={<div className="text-center py-8">Carregando...</div>}>
      <MessageForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </React.Suspense>
  );
};

export default ResponsiveLayout;