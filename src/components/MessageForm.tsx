
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Mic, Video, Image, Phone, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageFormProps {
  onSubmit: (data: MessageData) => void;
}

export interface MessageData {
  phoneNumber: string;
  message: string;
  mediaType: 'none' | 'photo' | 'audio' | 'video';
  mediaFile: File | null;
  price: number;
}

const MessageForm: React.FC<MessageFormProps> = ({ onSubmit }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [mediaType, setMediaType] = useState<'none' | 'photo' | 'audio' | 'video'>('none');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    if (numbers.length > 11) return phoneNumber;
    
    // Formata como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) {
      const ddd = numbers.slice(0, 2);
      const firstPart = numbers.slice(2, -4);
      const lastPart = numbers.slice(-4);
      return `(${ddd}) ${firstPart}-${lastPart}`;
    }
    
    return numbers;
  };

  const validatePhoneNumber = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length !== 10 && numbers.length !== 11) return false;
    
    const ddd = parseInt(numbers.slice(0, 2));
    
    // DDD acima de 30 não precisa do dígito 9
    if (ddd > 30 && numbers.length === 11) {
      return numbers[2] !== '9';
    }
    
    // DDD abaixo de 30 exige o dígito 9
    if (ddd <= 30 && numbers.length === 11) {
      return numbers[2] === '9';
    }
    
    // Para números com 10 dígitos, só aceita se DDD > 30
    if (numbers.length === 10) {
      return ddd > 30;
    }
    
    return false;
  };

  const calculatePrice = () => {
    switch (mediaType) {
      case 'video':
        return 10.00;
      case 'photo':
      case 'audio':
        return 5.00;
      default:
        return 5.00;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaType(type);
      toast({
        title: "Arquivo selecionado",
        description: `${type === 'photo' ? 'Foto' : 'Vídeo'} carregado com sucesso!`,
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      // Simulação de gravação por 3 segundos
      setTimeout(() => {
        setIsRecording(false);
        setMediaType('audio');
        stream.getTracks().forEach(track => track.stop());
        toast({
          title: "Áudio gravado",
          description: "Gravação de áudio concluída!",
        });
      }, 3000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone.",
        variant: "destructive",
      });
    }
  };

  const clearMedia = () => {
    setMediaType('none');
    setMediaFile(null);
  };

  const handleSubmit = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Número inválido",
        description: "Por favor, insira um número de WhatsApp válido.",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Mensagem obrigatória",
        description: "Por favor, digite uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      phoneNumber,
      message,
      mediaType,
      mediaFile,
      price: calculatePrice(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Zap Elegante</h1>
          <p className="text-lg text-gray-600">Envie mensagens no WhatsApp sem se identificar</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
              <Phone className="h-6 w-6 text-primary" />
              Envie um WhatsApp sem se identificar
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertDescription className="text-orange-800">
                <strong>Atenção:</strong> Se você digitar o número de telefone errado, a 
                mensagem <strong>não será entregue</strong> e <strong>não haverá reembolso</strong>.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Lembre-se do DDD
              </label>
              <p className="text-xs text-gray-600">
                Sempre inclua o <strong>DDD</strong> do número antes de enviar a mensagem.
              </p>
              <div className="relative">
                <Input
                  placeholder="(11) 99999-9999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  className="pl-10 text-lg h-12"
                />
                <Phone className="absolute left-3 top-3 h-6 w-6 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mensagem</label>
              <Textarea
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-24 text-base"
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 text-right">
                {message.length}/1000 caracteres
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Anexos (opcional)
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'photo')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="photo-upload"
                  />
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-50 border-2 border-dashed"
                    type="button"
                  >
                    <Image className="h-6 w-6" />
                    <span className="text-xs">Enviar Foto</span>
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={startRecording}
                  disabled={isRecording}
                  className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-red-50 border-2 border-dashed"
                >
                  <Mic className={`h-6 w-6 ${isRecording ? 'animate-pulse-slow text-red-500' : ''}`} />
                  <span className="text-xs">
                    {isRecording ? 'Gravando...' : 'Gravar Áudio'}
                  </span>
                </Button>

                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="video-upload"
                  />
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 border-2 border-dashed"
                    type="button"
                  >
                    <Video className="h-6 w-6" />
                    <span className="text-xs">Enviar Vídeo</span>
                  </Button>
                </div>
              </div>

              {mediaType !== 'none' && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {mediaType === 'photo' && <Image className="h-5 w-5 text-green-600" />}
                    {mediaType === 'audio' && <Mic className="h-5 w-5 text-green-600" />}
                    {mediaType === 'video' && <Video className="h-5 w-5 text-green-600" />}
                    <span className="text-sm text-green-800 capitalize">
                      {mediaType === 'photo' ? 'Foto' : mediaType === 'audio' ? 'Áudio' : 'Vídeo'} selecionado
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearMedia}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remover
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Preço por mensagem:
                </span>
                <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                  R$ {calculatePrice().toFixed(2)}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Ao enviar uma mensagem, você concorda com nossos Termos e Condições 
                e a Política de Privacidade.
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary-hover"
            >
              💬 Enviar Mensagem
            </Button>

            <div className="flex justify-center gap-4 text-sm">
              <Button variant="link" className="text-blue-600">
                📞 Enviar Áudio
              </Button>
              <Button variant="link" className="text-purple-600">
                📹 Enviar Foto/Vídeo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessageForm;
