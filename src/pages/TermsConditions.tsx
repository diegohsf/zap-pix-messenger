
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsConditions = () => {
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
              Termos e Condições
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Aceite dos Termos</h2>
                <p className="text-muted-foreground">
                  Ao utilizar nosso serviço, você concorda com estes termos e condições.
                  Se não concordar, não utilize o serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Descrição do Serviço</h2>
                <p className="text-muted-foreground">
                  Oferecemos um serviço de envio de mensagens via WhatsApp mediante pagamento.
                  O serviço permite enviar texto, imagens, vídeos e áudios para números brasileiros.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Responsabilidades do Usuário</h2>
                <p className="text-muted-foreground">
                  O usuário é responsável pelo conteúdo das mensagens enviadas e deve garantir que:
                </p>
                <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                  <li>O conteúdo não viola leis ou direitos de terceiros</li>
                  <li>Possui autorização para enviar mensagens para o número informado</li>
                  <li>Não utiliza o serviço para spam ou conteúdo inadequado</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Pagamentos</h2>
                <p className="text-muted-foreground">
                  Os pagamentos são processados via PIX e devem ser realizados antes do envio da mensagem.
                  Não oferecemos reembolsos após a confirmação do pagamento e envio da mensagem.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Limitações de Responsabilidade</h2>
                <p className="text-muted-foreground">
                  Não nos responsabilizamos por falhas na entrega das mensagens causadas por
                  problemas técnicos do WhatsApp, números bloqueados ou inválidos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Modificações</h2>
                <p className="text-muted-foreground">
                  Reservamos o direito de modificar estes termos a qualquer momento.
                  As alterações entrarão em vigor imediatamente após a publicação.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Contato</h2>
                <p className="text-muted-foreground">
                  Para dúvidas sobre estes termos, entre em contato: contato@exemplo.com
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsConditions;
