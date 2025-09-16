
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageForm, { MessageData } from '@/components/MessageForm';
import PaymentModal from '@/components/PaymentModal';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import CookieConsent from '@/components/CookieConsent';
import Analytics from '@/components/Analytics';
import { saveMessage } from '@/services/messageService';
import { uploadFile } from '@/services/fileUploadService';
import { useToast } from '@/hooks/use-toast';

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
    console.log('Preço a ser cobrado:', data.price);
    
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

      // Preparar dados para salvar no banco - usando o preço já calculado
      const messageData = {
        phoneNumber: data.phoneNumber,
        messageText: data.messageText,
        mediaType: data.mediaType,
        mediaFileUrl: fileUrl,
        mediaFileName: fileName,
        price: data.price, // Usar o preço já calculado com promoções
        couponCode: data.couponCode,
        originalPrice: data.originalPrice,
        discountAmount: data.discountAmount || 0
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

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEOHead />
      <Analytics />
      
      {/* Hero Section Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 -z-10 pointer-events-none"></div>
      
      {/* Subtle background shapes */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-200/30 to-blue-200/30 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full filter blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="flex-grow relative z-10">
        <MessageForm 
          onSubmit={handleFormSubmit} 
          isSubmitting={isSubmitting}
        />
      </div>
      <Footer />
      <CookieConsent />
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
