
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  HelpCircle, 
  Clock, 
  Phone, 
  Camera, 
  Shield, 
  CreditCard, 
  CheckCircle, 
  Ban, 
  MessageCircle, 
  Headphones, 
  Eye,
  Settings
} from 'lucide-react';

const FAQ: React.FC = () => {
  const faqItems = [
    {
      icon: Settings,
      question: "Como funciona o serviço?",
      answer: "Nosso serviço permite que você envie mensagens no WhatsApp sem revelar seu número de telefone. Basta digitar o número do destinatário, escrever sua mensagem, fazer o pagamento e nós entregaremos a mensagem para você de forma anônima."
    },
    {
      icon: Clock,
      question: "Quanto tempo demora para entregar?",
      answer: "Após a confirmação do pagamento, sua mensagem é entregue em até 5 minutos. O sistema processa automaticamente e envia sua mensagem assim que o PIX é confirmado."
    },
    {
      icon: Phone,
      question: "E se eu digitar o número errado?",
      answer: "Atenção: Se você digitar o número incorreto, a mensagem será enviada para o número digitado ou não será entregue se o número não existir. Não oferecemos reembolso em casos de número incorreto. Sempre confira o número antes de enviar."
    },
    {
      icon: Camera,
      question: "Posso enviar fotos e vídeos?",
      answer: "Sim! Você pode enviar fotos, vídeos e áudios junto com sua mensagem. Os preços são: Foto + Texto (R$ 10,00), Áudio + Texto (R$ 7,00), Vídeo + Texto (R$ 10,00), ou apenas Texto (R$ 5,00)."
    },
    {
      icon: Shield,
      question: "O destinatário saberá quem enviou?",
      answer: "Não, o destinatário não saberá quem enviou a mensagem. A mensagem aparecerá como vinda de um número desconhecido, mantendo total anonimato do remetente."
    },
    {
      icon: CreditCard,
      question: "Quais formas de pagamento aceitam?",
      answer: "Atualmente aceitamos apenas PIX. Após preencher o formulário, você receberá um QR Code para pagamento via PIX. O pagamento é processado instantaneamente."
    },
    {
      icon: CheckCircle,
      question: "O serviço é confiável e seguro?",
      answer: "Sim, nosso serviço é totalmente seguro e confiável. Utilizamos criptografia para proteger suas informações e não armazenamos dados pessoais sensíveis. Todas as mensagens são processadas automaticamente sem intervenção humana."
    },
    {
      icon: Ban,
      question: "Posso cancelar uma mensagem após o pagamento?",
      answer: "Uma vez confirmado o pagamento, a mensagem entra automaticamente na fila de envio e não pode ser cancelada. Por isso é importante revisar cuidadosamente todos os dados antes de finalizar o pagamento."
    },
    {
      icon: MessageCircle,
      question: "Há limite de caracteres para as mensagens?",
      answer: "Sim, o WhatsApp possui limite de caracteres por mensagem. Recomendamos mensagens de até 4.096 caracteres para garantir que sejam enviadas corretamente. Mensagens muito longas podem ser cortadas."
    },
    {
      icon: Shield,
      question: "O que acontece se o número estiver bloqueado?",
      answer: "Se o número do destinatário nos tiver bloqueado ou não aceitar mensagens de números desconhecidos, a mensagem não será entregue. Infelizmente, não temos como contornar essas configurações de privacidade do WhatsApp."
    },
    {
      icon: Headphones,
      question: "Vocês oferecem suporte ao cliente?",
      answer: "Sim! Temos suporte via WhatsApp e Instagram. Você pode nos contatar através dos ícones no rodapé da página. Respondemos rapidamente durante horário comercial e estamos sempre dispostos a ajudar com suas dúvidas."
    },
    {
      icon: Eye,
      question: "Posso saber se a pessoa leu ou respondeu minha mensagem?",
      answer: "Não, nosso serviço apenas entrega a mensagem. Não temos como saber se o destinatário visualizou, leu ou respondeu à mensagem enviada. O serviço funciona como um envio único e anônimo, sem retorno de informações sobre o status da mensagem após a entrega."
    }
  ];

  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-blue-50/30 to-purple-50/50 rounded-3xl -z-10"></div>
      
      <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-lg rounded-3xl overflow-hidden">
        {/* Beautiful Header */}
        <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-blue-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
          
          <CardHeader className="text-center py-12 relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <HelpCircle className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mb-2">
              Perguntas Frequentes
            </CardTitle>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Tire todas as suas dúvidas sobre nosso serviço de mensagens anônimas
            </p>
          </CardHeader>
        </div>

        <CardContent className="p-8">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={`item-${index + 1}`} 
                value={`item-${index + 1}`}
                className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-5 text-left hover:no-underline group">
                  <div className="flex items-center gap-4 w-full">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                      {item.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="bg-white/60 rounded-xl p-6 backdrop-blur-sm border border-gray-200/50">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {item.answer}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQ;
