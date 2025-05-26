
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
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
              <FileText className="h-8 w-8 text-primary" />
              Termos e Condições
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Aceitação dos Termos</h2>
              <p>
                Ao utilizar nosso serviço, você concorda com estes termos e condições. 
                Se não concordar, não utilize o serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Descrição do Serviço</h2>
              <p className="mb-3">
                Nosso serviço permite o envio de mensagens anônimas via WhatsApp. 
                Os preços são:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Mensagem de texto: R$ 5,00</li>
                <li>Mensagem com foto: R$ 10,00</li>
                <li>Mensagem com áudio: R$ 7,00</li>
                <li>Mensagem com vídeo: R$ 10,00</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Responsabilidades do Usuário</h2>
              <p className="mb-3">Você é responsável por:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Fornecer número de telefone correto do destinatário</li>
                <li>Não enviar conteúdo ilegal, ofensivo ou prejudicial</li>
                <li>Respeitar a privacidade e direitos do destinatário</li>
                <li>Usar o serviço de forma ética e legal</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Política de Reembolso</h2>
              <p>
                <strong>NÃO OFERECEMOS REEMBOLSO</strong> em casos de:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Número de telefone incorreto fornecido pelo usuário</li>
                <li>Mensagem entregue com sucesso</li>
                <li>Arrependimento após o envio</li>
                <li>Problemas no dispositivo do destinatário</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Limitações do Serviço</h2>
              <p>
                Não nos responsabilizamos por falhas na entrega devido a problemas 
                técnicos do WhatsApp, números bloqueados, ou dispositivos desligados do destinatário.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Conteúdo Proibido</h2>
              <p className="mb-3">É proibido enviar:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Conteúdo ilegal, ameaçador ou ofensivo</li>
                <li>Spam ou mensagens promocionais não solicitadas</li>
                <li>Material com direitos autorais sem permissão</li>
                <li>Conteúdo que viole leis locais ou internacionais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Modificações</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                As alterações entrarão em vigor imediatamente após a publicação.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contato</h2>
              <p>
                Para dúvidas sobre estes termos, entre em contato através dos 
                canais disponibilizados em nosso site.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
