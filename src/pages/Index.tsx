import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageForm, { MessageData } from '@/components/MessageForm';
import PaymentModal from '@/components/PaymentModal';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import { saveMessage } from '@/services/messageService';
import { uploadFile } from '@/services/fileUploadService';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Zap, Shield, Clock, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [currentMessageData, setCurrentMessageData] = useState<MessageData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFormSubmit = async (data: MessageData) => {
    console.log('=== PROCESSANDO ENVIO DO FORMULÁRIO ===');
    console.log('Dados recebidos:', data);
    
    setIsSubmitting(true);
    
    try {
      let fileUrl = '';
      let fileName = '';
      
      // Upload do arquivo de mídia se houver
      if (data.mediaFile && data.mediaType !== 'none') {
        console.log('=== INICIANDO UPLOAD DE MÍDIA ===');
        console.log('Arquivo:', data.mediaFile.name);
        console.log('Tipo:', data.mediaFile.type);
        console.log('Tamanho:', data.mediaFile.size, 'bytes');
        console.log('Tipo de mídia:', data.mediaType);
        
        try {
          const uploadResult = await uploadFile(data.mediaFile, data.mediaType);
          fileUrl = uploadResult.url;
          fileName = uploadResult.fileName;
          console.log('✅ Upload concluído:', { fileUrl, fileName });
        } catch (uploadError) {
          console.error('❌ ERRO no upload:', uploadError);
          throw uploadError;
        }
      }

      // Preparar dados para salvar no banco
      const messageData = {
        phoneNumber: data.phoneNumber,
        messageText: data.messageText,
        mediaType: data.mediaType,
        mediaFileUrl: fileUrl,
        mediaFileName: fileName,
        price: data.price
      };

      console.log('=== SALVANDO MENSAGEM NO BANCO ===');
      console.log('Dados para o banco:', messageData);

      // Salvar mensagem no banco de dados
      const savedMessage = await saveMessage(messageData);
      console.log('✅ Mensagem salva:', savedMessage);
      
      // Armazenar ID da mensagem e dados
      setCurrentMessageId(savedMessage.id);
      setCurrentMessageData(data);
      
      toast({
        title: "Mensagem salva!",
        description: "Agora proceda com o pagamento.",
      });
      
      // Abrir modal de pagamento
      setShowPaymentModal(true);
      
    } catch (error) {
      console.error('❌ ERRO ao processar mensagem:', error);
      console.error('Stack trace:', error);
      
      let errorMessage = "Erro ao processar mensagem. Tente novamente.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentConfirmed = (transactionId: string) => {
    console.log('Pagamento confirmado:', transactionId);
    
    // Redirecionar para a página de confirmação
    setShowPaymentModal(false);
    navigate(`/confirmacao/${transactionId}`);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setCurrentMessageId(null);
    setCurrentMessageData(null);
  };

  const scrollToForm = () => {
    document.getElementById('message-form')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-primary/10">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              WhatsApp Sender
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Envie mensagens via WhatsApp de forma <span className="text-primary font-semibold">rápida</span>, 
            <span className="text-primary font-semibold"> segura</span> e 
            <span className="text-primary font-semibold"> automatizada</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={scrollToForm}
              size="lg" 
              className="text-lg px-8 py-3 h-auto"
            >
              <Send className="h-5 w-5 mr-2" />
              Enviar Mensagem Agora
            </Button>
            <p className="text-sm text-gray-500">
              A partir de <span className="font-semibold text-primary">R$ 0,50</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Por que escolher nosso serviço?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-0">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Envio Instantâneo</h3>
                <p className="text-gray-600">
                  Sua mensagem é enviada imediatamente após a confirmação do pagamento
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-0">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">100% Seguro</h3>
                <p className="text-gray-600">
                  Seus dados são protegidos e não armazenamos suas mensagens
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-0">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Disponível 24/7</h3>
                <p className="text-gray-600">
                  Envie mensagens a qualquer hora do dia, todos os dias da semana
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Message Form Section */}
      <section id="message-form" className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Envie sua Mensagem
            </h2>
            <p className="text-lg text-gray-600">
              Preencha os dados abaixo e envie sua mensagem via WhatsApp
            </p>
          </div>
          
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 md:p-12">
              <MessageForm 
                onSubmit={handleFormSubmit} 
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-gray-600">
              Tire suas dúvidas sobre nosso serviço
            </p>
          </div>
          <FAQ />
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <PaymentModal
        isOpen={showPaymentModal}
        messageId={currentMessageId}
        messageData={currentMessageData}
        onPaymentConfirmed={handlePaymentConfirmed}
        onClose={handleClosePaymentModal}
      />
    </div>
  );
};

export default Index;
