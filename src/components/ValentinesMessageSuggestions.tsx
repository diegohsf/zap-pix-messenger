
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageCircle, Sparkles } from 'lucide-react';

const ValentinesMessageSuggestions: React.FC = () => {
  const suggestions = [
    {
      icon: "💌",
      title: "Mensagem Romântica",
      text: "Meu amor, você é a razão do meu sorriso todos os dias...",
      emoji: "💕"
    },
    {
      icon: "🎵", 
      title: "Áudio Carinhoso",
      text: "Grave uma música especial ou uma declaração de amor",
      emoji: "🎶"
    },
    {
      icon: "📸",
      title: "Foto Especial",
      text: "Compartilhe uma foto dos momentos mais especiais juntos",
      emoji: "💖"
    },
    {
      icon: "🎥",
      title: "Vídeo Romântico",
      text: "Crie um vídeo personalizado com suas melhores memórias",
      emoji: "💘"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-red-50 border-pink-200 shadow-xl mb-8">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-pink-800 flex items-center justify-center gap-2">
          <Heart className="h-6 w-6 text-red-500 fill-current animate-pulse" />
          💝 Ideias para o Dia dos Namorados
          <Sparkles className="h-6 w-6 text-pink-500" />
        </CardTitle>
        <p className="text-pink-600">
          Inspire-se com essas ideias românticas para surpreender seu amor
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-pink-200 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{suggestion.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-pink-800 mb-1 flex items-center gap-2">
                    {suggestion.title}
                    <span>{suggestion.emoji}</span>
                  </h4>
                  <p className="text-sm text-pink-600">{suggestion.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">Crie sua mensagem de amor agora!</span>
            <Heart className="h-5 w-5 fill-current animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValentinesMessageSuggestions;
