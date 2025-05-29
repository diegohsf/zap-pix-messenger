
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageForm from '@/components/MessageForm';
import PaymentModal from '@/components/PaymentModal';
import Footer from '@/components/Footer';
import { saveMessage } from '@/services/messageService';
import { uploadFile } from '@/services/fileUploadService';
import { useToast } from '@/hooks/use-toast';
import { MessageData } from '@/types/messageTypes';

const Index: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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
      
      // Armazenar dados da mensagem
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

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setCurrentMessageData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      <div className="flex-grow">
        <MessageForm 
          onSubmit={handleFormSubmit} 
          isSubmitting={isSubmitting}
        />
      </div>
      <Footer />
      {currentMessageData && (
        <PaymentModal
          isOpen={showPaymentModal}
          messageData={currentMessageData}
          pixCode={null}
          qrCodeUrl={null}
          isPaid={false}
          transactionId={null}
          onClose={handleClosePaymentModal}
        />
      )}
    </div>
  );
};

export default Index;
