
import React from 'react';
import { MessageSquare, Shield, Zap, Heart } from 'lucide-react';

const EnhancedHome: React.FC = () => {
  return (
    <div className="relative">
      {/* Hero Section with improved gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-16 px-6">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-200/20 to-green-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        {/* Floating hearts animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <Heart
              key={i}
              className={`absolute text-pink-300/30 animate-bounce`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
              size={16 + Math.random() * 8}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/25 transform hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center animate-bounce">
                <Heart className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            Zap Elegante
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-700 mb-8 font-medium animate-fade-in">
            Envie mensagens no WhatsApp sem se identificar
          </p>
          
          {/* Valentine's special badge */}
          <div className="mb-12 flex justify-center animate-fade-in">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform duration-300">
              <Heart className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">Especial Dia dos Namorados</span>
              <Heart className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Por que escolher o Zap Elegante?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group">
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">100% Anônimo</h3>
                <p className="text-gray-600 leading-relaxed">
                  Envie mensagens sem revelar sua identidade. Sua privacidade é nossa prioridade.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Mídia Suportada</h3>
                <p className="text-gray-600 leading-relaxed">
                  Envie fotos, áudios e vídeos junto com suas mensagens de forma segura.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Rápido e Fácil</h3>
                <p className="text-gray-600 leading-relaxed">
                  Interface simples e intuitiva. Envie sua mensagem em segundos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valentine's Special Section */}
      <div className="py-16 px-6 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
              <Heart className="w-4 h-4" />
              PROMOÇÃO ESPECIAL
              <Heart className="w-4 h-4" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Declare seu amor anonimamente
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Surpreenda quem você ama com uma mensagem especial no Dia dos Namorados. 
            Envie fotos, áudios românticos ou vídeos sem revelar sua identidade.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-pink-200/50">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">💕 Mensagens Românticas</h3>
              <p className="text-gray-600">Declare seu amor de forma misteriosa e especial</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-pink-200/50">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🎵 Áudios Carinhosos</h3>
              <p className="text-gray-600">Grave uma mensagem de voz cheia de carinho</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHome;
