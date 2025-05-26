
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageForm, { MessageData } from '@/components/MessageForm';
import PaymentModal from '@/components/PaymentModal';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <MessageForm 
        onSubmit={handleFormSubmit} 
        isSubmitting={isSubmitting}
      />
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
