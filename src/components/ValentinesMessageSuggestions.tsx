
import React from 'react';
import { Heart, MessageCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MessageSuggestion {
  title: string;
  message: string;
  emoji: string;
}

const ValentinesMessageSuggestions: React.FC = () => {
  const suggestions: MessageSuggestion[] = [
    {
      title: "Romântica Clássica",
      message: "Você é a razão do meu sorriso todos os dias. Te amo mais do que as palavras podem expressar! 💕",
      emoji: "🌹"
    },
    {
      title: "Divertida e Carinhosa",
      message: "Se amar você fosse crime, eu seria condenada à prisão perpétua... e adoraria cada segundo! 😍",
      emoji: "😘"
    },
    {
      title: "Poética",
      message: "Em um mundo cheio de pessoas, meus olhos sempre te procuram. Você é meu lugar favorito. 🌟",
      emoji: "✨"
    },
    {
      title: "Simples e Sincera",
      message: "Oi amor! Só queria que você soubesse que está sempre no meu coração. Feliz Dia dos Namorados! 💖",
      emoji: "💝"
    }
  ];

  return (
    <div className="relative z-10 mt-8 px-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          <MessageCircle className="text-pink-500 w-6 h-6" />
          <h2 className="text-2xl font-bold text-gray-800">Inspirações para sua Mensagem</h2>
          <Sparkles className="text-pink-500 w-6 h-6" />
        </div>
        <p className="text-gray-600">Escolha uma das nossas sugestões ou crie sua própria declaração de amor!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="bg-white/90 backdrop-blur-sm border-pink-200 hover:border-pink-300 transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{suggestion.emoji}</span>
                <h3 className="font-semibold text-gray-800">{suggestion.title}</h3>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "{suggestion.message}"
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-2 text-pink-600">
          <Heart className="w-5 h-5 animate-pulse" />
          <span className="text-sm font-medium">Personalize sua mensagem com fotos, vídeos ou áudios especiais!</span>
          <Heart className="w-5 h-5 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ValentinesMessageSuggestions;
