
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

const FAQ = () => {
  const faqItems = [
    {
      question: "Como funciona o envio de mensagens?",
      answer: "Você preenche o formulário com o número do WhatsApp, sua mensagem e opcionalmente anexa uma mídia. Após o pagamento, sua mensagem será enviada automaticamente."
    },
    {
      question: "Quais tipos de mídia posso enviar?",
      answer: "Você pode enviar imagens (PNG, JPG, JPEG), vídeos (MP4, MOV) e áudios (MP3, WAV). O tamanho máximo é de 16MB por arquivo."
    },
    {
      question: "Quanto custa enviar uma mensagem?",
      answer: "O preço varia de acordo com o tipo de conteúdo. Mensagens de texto custam R$ 0,50, com imagem R$ 1,00, com vídeo R$ 1,50 e com áudio R$ 1,00."
    },
    {
      question: "Como faço o pagamento?",
      answer: "Aceitamos pagamentos via PIX. Após preencher o formulário, você será direcionado para a tela de pagamento onde poderá escanear o QR Code ou copiar o código PIX."
    },
    {
      question: "A mensagem é enviada imediatamente?",
      answer: "Sim! Assim que o pagamento é confirmado, sua mensagem é enviada automaticamente para o número informado."
    },
    {
      question: "O serviço funciona para números internacionais?",
      answer: "Atualmente o serviço funciona apenas para números brasileiros. O número deve estar no formato (11) 99999-9999."
    }
  ];

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-8">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-100">
              <AccordionTrigger className="text-left font-medium text-gray-800 hover:text-primary py-6">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FAQ;
