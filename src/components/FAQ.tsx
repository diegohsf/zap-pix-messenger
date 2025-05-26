
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

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
      question: "Posso cancelar o envio?",
      answer: "Devido à natureza instantânea do serviço, não é possível cancelar após a confirmação do pagamento. Certifique-se de que todos os dados estão corretos antes de pagar."
    },
    {
      question: "O serviço funciona para números internacionais?",
      answer: "Atualmente o serviço funciona apenas para números brasileiros. O número deve estar no formato (11) 99999-9999."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim! Não armazenamos o conteúdo das suas mensagens por mais tempo que o necessário para o envio. Todos os dados são tratados de acordo com a LGPD."
    }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
          <HelpCircle className="h-6 w-6" />
          Perguntas Frequentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
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
