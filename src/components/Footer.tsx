
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-auto w-full overflow-hidden bg-muted/50 border-t border-border">
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/20 to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="/lovable-uploads/3e6eee2a-1da2-41e1-9f5f-8714a36c8ce5.png" 
                  alt="Zap Elegante" 
                  className="h-10 w-auto sm:h-12"
                />
                <div className="h-8 w-px bg-border"></div>
                <span className="text-lg font-semibold text-foreground">Zap Elegante</span>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-md">
                Envie mensagens no WhatsApp sem se identificar de forma segura e anônima. 
                A privacidade que você precisa na palma da sua mão.
              </p>
              
              {/* Social Icons */}
              <div className="flex items-center gap-4 mt-6">
                <a 
                  href="https://www.instagram.com/zap_elegante?igsh=MWF0bzg1c3pwYWIyOQ==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
                >
                  <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
                >
                  <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
            
            {/* Links Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Links Úteis
              </h4>
              <nav className="flex flex-col space-y-3">
                <Link 
                  to="/blog"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm group"
                >
                  <span className="relative">
                    Blog
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
                <Link 
                  to="/privacidade"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm group"
                >
                  <span className="relative">
                    Política de Privacidade
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
                <Link 
                  to="/termos"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm group"
                >
                  <span className="relative">
                    Termos e Condições
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
              </nav>
            </div>
            
            {/* Contact Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Suporte
              </h4>
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Dúvidas? Entre em contato através do nosso WhatsApp.
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-fit border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <a 
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle size={14} />
                    Falar no WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="my-8 sm:my-12 border-t border-border"></div>
          
          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              © 2024 Zap Elegante. Feito com 
              <Heart size={12} className="text-primary fill-current mx-0.5" />
              no Brasil.
            </p>
            <p className="text-center sm:text-right">
              Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
