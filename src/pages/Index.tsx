
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
    console.log('Dados do formulário:', data);
    setIsSubmitting(true);
    
    try {
      let fileUrl = '';
      let fileName = '';
      
      // Upload do arquivo de mídia se houver
      if (data.mediaFile && data.mediaType !== 'none') {
        console.log('Fazendo upload do arquivo:', data.mediaFile.name);
        const uploadResult = await uploadFile(data.mediaFile, data.mediaType);
        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
        console.log('Arquivo enviado com sucesso:', { fileUrl, fileName });
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

      // Salvar mensagem no banco de dados
      const savedMessage = await saveMessage(messageData);
      console.log('Mensagem salva no banco:', savedMessage);
      
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
      console.error('Erro ao processar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar mensagem. Tente novamente.",
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
      />
    </div>
  );
};

export default Index;
