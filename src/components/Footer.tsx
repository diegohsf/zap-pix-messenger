
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Zap Elegante</h3>
            <p className="text-gray-400 text-sm">
              Envie mensagens no WhatsApp sem se identificar de forma segura e anônima.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Links Úteis</h4>
            <div className="space-y-2">
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
            <p className="text-gray-400 text-sm">
              Para dúvidas ou suporte, entre em contato através do nosso WhatsApp.
            </p>
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
