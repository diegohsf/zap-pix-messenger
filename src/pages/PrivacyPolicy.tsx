
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          onClick={() => navigate('/')} 
          variant="outline" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-primary">
              Política de Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Coleta de Informações</h2>
                <p className="text-muted-foreground">
                  Coletamos apenas as informações necessárias para o funcionamento do serviço, incluindo:
                  número de telefone do destinatário, conteúdo da mensagem e mídias anexadas.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Uso das Informações</h2>
                <p className="text-muted-foreground">
                  As informações coletadas são utilizadas exclusivamente para o envio da mensagem solicitada.
                  Não compartilhamos, vendemos ou utilizamos seus dados para outros fins.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Armazenamento de Dados</h2>
                <p className="text-muted-foreground">
                  Os dados são armazenados temporariamente apenas pelo tempo necessário para o processamento
                  e envio da mensagem. Após o envio, as informações são automaticamente removidas.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Segurança</h2>
                <p className="text-muted-foreground">
                  Implementamos medidas de segurança adequadas para proteger suas informações contra
                  acesso não autorizado, alteração, divulgação ou destruição.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Direitos do Usuário</h2>
                <p className="text-muted-foreground">
                  De acordo com a LGPD, você tem direito ao acesso, correção, exclusão e portabilidade
                  dos seus dados pessoais. Entre em contato conosco para exercer esses direitos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Contato</h2>
                <p className="text-muted-foreground">
                  Para dúvidas sobre esta política de privacidade, entre em contato conosco através
                  do email: contato@exemplo.com
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
