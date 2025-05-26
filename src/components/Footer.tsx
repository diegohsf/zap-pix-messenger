
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Shield, FileText } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo/Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-gray-800">WhatsApp Sender</span>
            </div>
            <p className="text-gray-600 text-sm">
              Envie mensagens via WhatsApp de forma rápida e segura.
            </p>
          </div>

          {/* Links */}
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 mb-4">Links Importantes</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/politica-privacidade')}
                className="w-full justify-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Política de Privacidade
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/termos-condicoes')}
                className="w-full justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Termos e Condições
              </Button>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-right">
            <h3 className="font-semibold text-gray-800 mb-4">Contato</h3>
            <p className="text-gray-600 text-sm mb-2">
              Email: contato@exemplo.com
            </p>
            <p className="text-gray-600 text-sm">
              Suporte: (11) 99999-9999
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} WhatsApp Sender. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
