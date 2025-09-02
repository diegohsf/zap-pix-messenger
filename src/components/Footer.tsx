
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 w-full">
      <div className="max-w-full mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/3e6eee2a-1da2-41e1-9f5f-8714a36c8ce5.png" 
                alt="Zap Elegante" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm">
              Envie mensagens no WhatsApp sem se identificar de forma segura e anônima.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Links Úteis</h4>
            <div className="space-y-2">
              <Link to="/blog">
                <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto">
                  Blog
                </Button>
              </Link>
              <br />
              <Link to="/privacidade">
                <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto">
                  Política de Privacidade
                </Button>
              </Link>
              <br />
              <Link to="/termos">
                <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto">
                  Termos e Condições
                </Button>
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Contato</h4>
            <p className="text-gray-400 text-sm mb-4">
              Para dúvidas ou suporte, entre em contato através do nosso WhatsApp.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/zap_elegante?igsh=MWF0bzg1c3pwYWIyOQ==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram size={24} />
              </a>
              <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <MessageCircle size={24} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Zap Elegante. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
