
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Shield, FileText, Heart } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo/Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary/20">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold">WhatsApp Sender</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Envie mensagens via WhatsApp de forma rápida, segura e automatizada.
            </p>
          </div>

          {/* Links */}
          <div className="text-center">
            <h3 className="font-semibold text-white mb-6 text-lg">Links Importantes</h3>
            <div className="space-y-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/politica-privacidade')}
                className="w-full justify-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Shield className="h-4 w-4" />
                Política de Privacidade
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/termos-condicoes')}
                className="w-full justify-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <FileText className="h-4 w-4" />
                Termos e Condições
              </Button>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-right">
            <h3 className="font-semibold text-white mb-6 text-lg">Contato</h3>
            <div className="space-y-2 text-gray-300">
              <p>Email: contato@whatsappsender.com</p>
              <p>Suporte: (11) 99999-9999</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 flex items-center justify-center gap-2">
            © {new Date().getFullYear()} WhatsApp Sender. Feito com 
            <Heart className="h-4 w-4 text-red-500" /> 
            no Brasil.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
