import React, { Suspense, lazy } from 'react';

// Lazy load heavy components
const LazyRecentMessages = lazy(() => import('./RecentMessages'));
const LazyFAQ = lazy(() => import('./FAQ'));

// Loading fallback component
const LoadingFallback: React.FC<{ height?: string }> = ({ height = "200px" }) => (
  <div className={`flex items-center justify-center bg-gray-50 rounded-lg`} style={{ height }}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Performance optimized wrapper for heavy components
const PerformanceWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
};

// Optimized FAQ component
export const OptimizedFAQ: React.FC = () => (
  <PerformanceWrapper>
    <LazyFAQ />
  </PerformanceWrapper>
);

// Optimized Recent Messages component
export const OptimizedRecentMessages: React.FC = () => (
  <PerformanceWrapper>
    <LazyRecentMessages />
  </PerformanceWrapper>
);

export default { OptimizedFAQ, OptimizedRecentMessages };