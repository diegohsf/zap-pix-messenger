import React, { useEffect } from 'react';

const Analytics: React.FC = () => {
  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'WhatsApp Anônimo - Home',
        page_location: window.location.href,
      });
    }

    // Track user engagement
    const trackEngagement = () => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'engagement', {
          engagement_time_msec: Date.now()
        });
      }
    };

    // Track engagement after 30 seconds
    const timer = setTimeout(trackEngagement, 30000);

    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default Analytics;