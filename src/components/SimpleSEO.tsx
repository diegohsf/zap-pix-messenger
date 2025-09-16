import React, { useEffect } from 'react';

interface SimpleSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const SimpleSEO: React.FC<SimpleSEOProps> = ({
  title = "WhatsApp Anônimo - Envie Mensagens sem Revelar Identidade",
  description = "Envie mensagens, fotos, áudios e vídeos no WhatsApp de forma completamente anônima. Rápido, seguro e sem revelar sua identidade. Mais de 12.000 mensagens enviadas com sucesso.",
  keywords = "whatsapp anonimo, mensagem anonima, enviar whatsapp, anonimo whatsapp, mensagem secreta, whatsapp sem revelar numero"
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.content = content;
    };

    // Basic SEO tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:url', window.location.href, true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "WhatsApp Anônimo",
      "description": description,
      "url": window.location.href,
      "applicationCategory": "CommunicationApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "1.00",
        "priceCurrency": "BRL",
        "description": "Envio de mensagem de texto anônima via WhatsApp"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "2847",
        "bestRating": "5",
        "worstRating": "1"
      }
    };

    // Remove existing structured data script
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }, [title, description, keywords]);

  return null;
};

export default SimpleSEO;