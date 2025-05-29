import { supabase } from '@/integrations/supabase/client';

export interface MessageData {
  phoneNumber: string;
  messageText: string;
  mediaType: 'none' | 'photo' | 'audio' | 'video';
  mediaFileUrl?: string;
  mediaFileName?: string;
  price: number;
  couponCode?: string;
  originalPrice?: number;
  discountAmount?: number;
}

export interface SavedMessage {
  id: string;
  phone_number: string;
  message_text: string;
  media_type: string;
  media_file_url?: string;
  media_file_name?: string;
  price: number;
  status: string;
  transaction_id?: string;
  openpix_charge_id?: string;
  pix_code?: string;
  qr_code_url?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  sent_at?: string;
  coupon_code?: string;
  original_price?: number;
  discount_amount?: number;
}

export const saveMessage = async (data: MessageData): Promise<SavedMessage> => {
  console.log('Saving message to database:', data);

  const { data: savedMessage, error } = await supabase
    .from('messages')
    .insert({
      phone_number: data.phoneNumber,
      message_text: data.messageText,
      media_type: data.mediaType,
      media_file_url: data.mediaFileUrl,
      media_file_name: data.mediaFileName,
      price: data.price,
      coupon_code: data.couponCode,
      original_price: data.originalPrice,
      discount_amount: data.discountAmount || 0,
      status: 'pending_payment'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving message:', error);
    throw new Error('Erro ao salvar mensagem no banco de dados');
  }

  console.log('Message saved successfully:', savedMessage);
  return savedMessage;
};

export const updateMessagePayment = async (
  messageId: string, 
  paymentData: {
    transaction_id: string;
    openpix_charge_id?: string;
    pix_code?: string;
    qr_code_url?: string;
    status: 'paid' | 'failed';
  }
): Promise<SavedMessage> => {
  console.log('Updating message payment:', messageId, paymentData);

  const updateData: any = {
    ...paymentData,
    updated_at: new Date().toISOString(),
  };

  if (paymentData.status === 'paid') {
    updateData.paid_at = new Date().toISOString();
  }

  const { data: updatedMessage, error } = await supabase
    .from('messages')
    .update(updateData)
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    console.error('Error updating message payment:', error);
    throw new Error('Erro ao atualizar status de pagamento');
  }

  console.log('Message payment updated successfully:', updatedMessage);
  return updatedMessage;
};

export const getMessageById = async (messageId: string): Promise<SavedMessage | null> => {
  const { data: message, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single();

  if (error) {
    console.error('Error fetching message:', error);
    return null;
  }

  return message;
};

export const getMessageByTransactionId = async (transactionId: string): Promise<SavedMessage | null> => {
  const { data: message, error } = await supabase
    .from('messages')
    .select('*')
    .eq('transaction_id', transactionId)
    .single();

  if (error) {
    console.error('Error fetching message by transaction ID:', error);
    return null;
  }

  return message;
};
