import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "WhatsApp Anônimo - Envie Mensagens sem Revelar Identidade",
  description = "Envie mensagens, fotos, áudios e vídeos no WhatsApp de forma completamente anônima. Rápido, seguro e sem revelar sua identidade. Mais de 12.000 mensagens enviadas com sucesso.",
  keywords = "whatsapp anonimo, mensagem anonima, enviar whatsapp, anonimo whatsapp, mensagem secreta, whatsapp sem revelar numero",
  canonicalUrl = "https://zapanonimo.com"
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "WhatsApp Anônimo",
    "description": description,
    "url": canonicalUrl,
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
    },
    "creator": {
      "@type": "Organization",
      "name": "WhatsApp Anônimo",
      "url": canonicalUrl
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="WhatsApp Anônimo" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#10b981" />
      
      {/* Performance & Security */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;