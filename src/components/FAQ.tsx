
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FAQ: React.FC = () => {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          Perguntas Frequentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Como funciona o serviço?</AccordionTrigger>
            <AccordionContent>
              Nosso serviço permite que você envie mensagens no WhatsApp sem revelar seu número de telefone. 
              Basta digitar o número do destinatário, escrever sua mensagem, fazer o pagamento e nós entregaremos 
              a mensagem para você de forma anônima.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>Quanto tempo demora para entregar?</AccordionTrigger>
            <AccordionContent>
              Após a confirmação do pagamento, sua mensagem é entregue em até 5 minutos. 
              O sistema processa automaticamente e envia sua mensagem assim que o PIX é confirmado.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>E se eu digitar o número errado?</AccordionTrigger>
            <AccordionContent>
              <strong>Atenção:</strong> Se você digitar o número incorreto, a mensagem será enviada para 
              o número digitado ou não será entregue se o número não existir. 
              <strong>Não oferecemos reembolso</strong> em casos de número incorreto. 
              Sempre confira o número antes de enviar.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger>Posso enviar fotos e vídeos?</AccordionTrigger>
            <AccordionContent>
              Sim! Você pode enviar fotos, vídeos e áudios junto com sua mensagem. 
              Os preços são: Foto + Texto (R$ 10,00), Áudio + Texto (R$ 7,00), 
              Vídeo + Texto (R$ 10,00), ou apenas Texto (R$ 5,00).
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>O destinatário saberá quem enviou?</AccordionTrigger>
            <AccordionContent>
              Não, o destinatário não saberá quem enviou a mensagem. A mensagem aparecerá 
              como vinda de um número desconhecido, mantendo total anonimato do remetente.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-6">
            <AccordionTrigger>Quais formas de pagamento aceitam?</AccordionTrigger>
            <AccordionContent>
              Atualmente aceitamos apenas PIX. Após preencher o formulário, você receberá 
              um QR Code para pagamento via PIX. O pagamento é processado instantaneamente.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FAQ;
