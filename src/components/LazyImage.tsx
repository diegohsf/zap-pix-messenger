import React, { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3C/svg%3E'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={isLoaded ? src : placeholder}
      alt={alt}
      className={`transition-opacity duration-300 ${className} ${isLoaded ? 'opacity-100' : 'opacity-70'}`}
      loading="lazy"
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      style={{
        filter: isLoaded ? 'none' : 'blur(2px)',
      }}
    />
  );
};

export default LazyImage;