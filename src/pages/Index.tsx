
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageForm, { MessageData } from '@/components/MessageForm';
import PaymentModal from '@/components/PaymentModal';

const Index: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentMessageData, setCurrentMessageData] = useState<MessageData | null>(null);
  const navigate = useNavigate();

  const handleFormSubmit = (data: MessageData) => {
    console.log('Dados do formulário:', data);
    
    // Simula salvamento no banco de dados
    const savedData = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      status: 'pending_payment'
    };
    
    console.log('Dados salvos no "banco":', savedData);
    
    // Abre o modal de pagamento
    setCurrentMessageData(data);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirmed = (transactionId: string) => {
    console.log('Pagamento confirmado:', transactionId);
    
    // Atualiza o status no "banco de dados"
    const updatedData = {
      ...currentMessageData,
      transactionId,
      status: 'paid',
      paidAt: new Date().toISOString()
    };
    
    console.log('Dados atualizados após pagamento:', updatedData);
    
    // Redireciona para a página de confirmação
    setShowPaymentModal(false);
    navigate(`/confirmacao/${transactionId}`);
  };

  return (
    <>
      <MessageForm onSubmit={handleFormSubmit} />
      <PaymentModal
        isOpen={showPaymentModal}
        messageData={currentMessageData}
        onPaymentConfirmed={handlePaymentConfirmed}
      />
    </>
  );
};

export default Index;
