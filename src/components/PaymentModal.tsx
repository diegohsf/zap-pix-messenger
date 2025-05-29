import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Copy, CheckCircle } from 'lucide-react';
import { MessageData } from '@/types/messageTypes';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageData: MessageData;
  pixCode: string | null;
  qrCodeUrl: string | null;
  isPaid: boolean;
  transactionId: string | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  messageData, 
  pixCode, 
  qrCodeUrl, 
  isPaid,
  transactionId
}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopyClick = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {isPaid ? 'Pagamento Confirmado' : 'Realize o Pagamento'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isPaid ? (
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                <p className="text-gray-700 mb-2">
                  Seu pagamento foi confirmado!
                </p>
                <p className="text-sm text-gray-500">
                  A mensagem será enviada em breve.
                </p>
                {transactionId && (
                  <p className="text-xs text-gray-400 mt-2">
                    ID da transação: {transactionId}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {qrCodeUrl ? (
                  <div className="text-center">
                    <img src={qrCodeUrl} alt="QR Code Pix" className="mx-auto w-64 h-64" />
                    <p className="text-gray-700 mt-2">
                      Escaneie o QR Code para pagar com Pix
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-700">
                      Gerando QR Code...
                    </p>
                  </div>
                )}
                {pixCode && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-700">
                        Código Pix:
                      </p>
                      <Badge variant="secondary">
                        R$ {messageData.price.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={pixCode}
                        readOnly
                        className="w-full p-3 rounded border text-gray-700 bg-gray-50"
                      />
                      <Button
                        onClick={handleCopyClick}
                        className="absolute right-1 top-1 h-10 rounded px-4"
                        disabled={isCopied}
                      >
                        {isCopied ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  Após o pagamento, a mensagem será enviada automaticamente.
                </p>
              </div>
            )}
            <div className="text-center mt-4">
              <Button onClick={onClose} variant="outline">
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentModal;
