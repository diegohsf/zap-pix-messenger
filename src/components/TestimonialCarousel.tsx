import React, { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialCarousel: React.FC = () => {
  const testimonials = [
    {
      text: "Funcionou perfeitamente! Consegui enviar minha mensagem sem revelar minha identidade. Super recomendo!",
      author: "Maria S.",
      rating: 5,
      verified: true
    },
    {
      text: "Rápido e eficiente. Pagamento via PIX foi instantâneo e a mensagem foi entregue em segundos.",
      author: "João P.",
      rating: 5,
      verified: true
    },
    {
      text: "Excelente serviço! Usei para enviar uma foto e funcionou exatamente como prometido. Muito bom!",
      author: "Ana L.",
      rating: 5,
      verified: true
    },
    {
      text: "Interface simples e intuitiva. Consegui usar sem nenhuma dificuldade. Parabéns pelo projeto!",
      author: "Carlos M.",
      rating: 5,
      verified: true
    },
    {
      text: "Serviço confiável e discreto. Já usei várias vezes e sempre funcionou perfeitamente.",
      author: "Patricia R.",
      rating: 5,
      verified: true
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 relative overflow-hidden">
      <div className="absolute top-2 right-2 opacity-10">
        <Quote className="h-12 w-12 text-gray-400" />
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < currentTestimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        
        <p className="text-gray-700 italic mb-3 min-h-[3rem] flex items-center justify-center">
          "{currentTestimonial.text}"
        </p>
        
        <div className="flex items-center justify-center gap-2">
          <span className="font-medium text-gray-900">— {currentTestimonial.author}</span>
          {currentTestimonial.verified && (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
              ✓ Verificado
            </span>
          )}
        </div>
      </div>
      
      {/* Progress indicators */}
      <div className="flex justify-center mt-4 gap-1">
        {testimonials.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-green-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;