
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl text-gray-800 flex items-center justify-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Política de Privacidade
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Coleta de Informações</h2>
              <p className="mb-3">
                Coletamos apenas as informações necessárias para prestar nosso serviço:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Número de telefone do destinatário</li>
                <li>Conteúdo da mensagem a ser enviada</li>
                <li>Arquivos de mídia (quando aplicável)</li>
                <li>Informações de pagamento (processadas por terceiros)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Uso das Informações</h2>
              <p className="mb-3">
                Utilizamos suas informações exclusivamente para:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Entregar sua mensagem ao destinatário especificado</li>
                <li>Processar o pagamento do serviço</li>
                <li>Manter registros necessários para funcionamento do serviço</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Proteção de Dados</h2>
              <p>
                Não armazenamos permanentemente o conteúdo das mensagens. Após a entrega, 
                as mensagens são removidas de nossos sistemas. Utilizamos criptografia e 
                medidas de segurança adequadas para proteger suas informações.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Compartilhamento</h2>
              <p>
                Não compartilhamos, vendemos ou alugamos suas informações pessoais para terceiros, 
                exceto quando necessário para prestação do serviço (entrega da mensagem) ou 
                quando exigido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Seus Direitos</h2>
              <p>
                Você tem o direito de solicitar informações sobre seus dados, bem como 
                sua correção ou exclusão, conforme aplicável pela lei de proteção de dados.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Contato</h2>
              <p>
                Para questões sobre esta política de privacidade, entre em contato conosco 
                através dos canais disponibilizados em nosso site.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
