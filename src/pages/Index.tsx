
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageForm, { MessageData } from '@/components/MessageForm';
import PaymentModal from '@/components/PaymentModal';
import Footer from '@/components/Footer';
import BlogSection from '@/components/BlogSection';
import { saveMessage } from '@/services/messageService';
import { uploadFile } from '@/services/fileUploadService';
import { generateBlogPost } from '@/services/blogService';
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

  const handlePaymentConfirmed = async (transactionId: string) => {
    console.log('🎉 Pagamento confirmado! ID da transação:', transactionId);
    
    // Tentar gerar post do blog automaticamente
    if (currentMessageId) {
      try {
        console.log('🤖 Tentando gerar post do blog para mensagem:', currentMessageId);
        const result = await generateBlogPost(currentMessageId);
        console.log('✅ Post do blog gerado com sucesso!', result);
        
        toast({
          title: "Post do blog criado!",
          description: "Uma notícia foi gerada automaticamente.",
        });
      } catch (error) {
        console.error('❌ Erro ao gerar post do blog:', error);
        // Não mostrar erro ao usuário, é funcionalidade secundária
      }
    }
    
    // Fechar modal e limpar dados
    setShowPaymentModal(false);
    setCurrentMessageId(null);
    setCurrentMessageData(null);
    
    // Redirecionar para a página de confirmação com o ID da transação
    console.log('🔄 Redirecionando para página de confirmação...');
    navigate(`/confirmacao/${transactionId}`);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setCurrentMessageId(null);
    setCurrentMessageData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      <div className="flex-grow">
        <MessageForm 
          onSubmit={handleFormSubmit} 
          isSubmitting={isSubmitting}
        />
        
        <div className="container mx-auto px-4 py-8">
          {/* Seção do Blog */}
          <BlogSection />
        </div>
      </div>
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
