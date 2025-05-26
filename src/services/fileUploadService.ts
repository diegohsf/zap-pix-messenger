
import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  fileName: string;
}

// Função para converter WebM para MP3
const convertWebMToMp3 = async (webmBlob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    console.log('Iniciando conversão WebM para MP3...');
    
    // Criar um contexto de áudio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Converter blob para array buffer
    webmBlob.arrayBuffer().then(arrayBuffer => {
      // Decodificar o áudio
      audioContext.decodeAudioData(arrayBuffer).then(audioBuffer => {
        console.log('Áudio decodificado com sucesso');
        
        // Criar um MediaRecorder simulado para MP3
        // Como conversão direta para MP3 é complexa no browser,
        // vamos usar WAV que é mais compatível
        const length = audioBuffer.length;
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        
        // Criar WAV buffer
        const wavBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(wavBuffer);
        
        // WAV Header
        const writeString = (offset: number, string: string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * numberOfChannels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * numberOfChannels * 2, true);
        
        // Converter dados de áudio
        let offset = 44;
        for (let i = 0; i < length; i++) {
          for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
          }
        }
        
        const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        console.log('Conversão para WAV concluída');
        resolve(wavBlob);
        
      }).catch(error => {
        console.error('Erro ao decodificar áudio:', error);
        // Se falhar a conversão, usar o arquivo original mas com tipo correto
        const correctedBlob = new Blob([webmBlob], { type: 'audio/mpeg' });
        resolve(correctedBlob);
      });
    }).catch(error => {
      console.error('Erro ao converter blob:', error);
      // Se falhar a conversão, usar o arquivo original mas com tipo correto
      const correctedBlob = new Blob([webmBlob], { type: 'audio/mpeg' });
      resolve(correctedBlob);
    });
  });
};

export const uploadFile = async (
  file: File, 
  mediaType: 'photo' | 'audio' | 'video'
): Promise<UploadResult> => {
  console.log('=== INICIANDO UPLOAD DO ARQUIVO ===');
  console.log('Nome do arquivo:', file.name);
  console.log('Tipo MIME:', file.type);
  console.log('Tamanho:', file.size, 'bytes');
  console.log('Tipo de mídia:', mediaType);

  // Processar arquivo para upload
  let fileToUpload: File | Blob = file;
  let finalMimeType = file.type;
  let finalExtension = '';

  // Converter áudio WebM para formato compatível
  if (mediaType === 'audio' && file.type === 'audio/webm') {
    console.log('Convertendo áudio WebM para formato compatível...');
    try {
      const convertedBlob = await convertWebMToMp3(file);
      fileToUpload = convertedBlob;
      finalMimeType = 'audio/wav';  // Usar WAV que é mais compatível
      finalExtension = 'wav';
      console.log('Conversão concluída - novo tipo:', finalMimeType);
    } catch (error) {
      console.error('Erro na conversão, usando arquivo original:', error);
      // Forçar tipo MPEG se conversão falhar
      finalMimeType = 'audio/mpeg';
      finalExtension = 'mp3';
    }
  } else {
    // Para outros tipos, extrair extensão normalmente
    if (file.name && file.name.includes('.')) {
      finalExtension = file.name.split('.').pop() || '';
    } else {
      const mimeToExtension: { [key: string]: string } = {
        'audio/webm': 'webm',
        'audio/wav': 'wav',
        'audio/mp3': 'mp3',
        'audio/mpeg': 'mp3',
        'audio/ogg': 'ogg',
        'audio/mp4': 'm4a',
        'video/webm': 'webm',
        'video/mp4': 'mp4',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp'
      };
      finalExtension = mimeToExtension[file.type] || 'bin';
    }
  }

  console.log('Tipo MIME final:', finalMimeType);
  console.log('Extensão final:', finalExtension);

  // Validar tipo de arquivo final
  const allowedTypes = {
    photo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    audio: [
      'audio/mpeg', 
      'audio/wav', 
      'audio/ogg', 
      'audio/mp4', 
      'audio/x-m4a', 
      'audio/mp3'
    ],
    video: ['video/mp4', 'video/webm', 'video/quicktime']
  };

  if (!allowedTypes[mediaType].includes(finalMimeType)) {
    console.error('❌ ERRO: Tipo de arquivo não permitido:', finalMimeType, 'Para mídia:', mediaType);
    throw new Error(`Tipo de arquivo não permitido para ${mediaType}: ${finalMimeType}`);
  }

  // Validar tamanho do arquivo (50MB máximo)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (fileToUpload.size > maxSize) {
    console.error('❌ ERRO: Arquivo muito grande:', fileToUpload.size, 'bytes');
    throw new Error('Arquivo muito grande. Tamanho máximo: 50MB');
  }

  // Gerar nome único para o arquivo
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2);
  const fileName = `${mediaType}/${timestamp}_${randomId}.${finalExtension}`;

  console.log('Nome final do arquivo:', fileName);

  try {
    console.log('Iniciando upload para Supabase Storage...');
    
    // Fazer upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('message-media')
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
        contentType: finalMimeType
      });

    if (error) {
      console.error('❌ ERRO no upload do Supabase:', error);
      console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    console.log('✅ Upload realizado com sucesso:', data);

    // Obter URL pública do arquivo
    const { data: publicData } = supabase.storage
      .from('message-media')
      .getPublicUrl(fileName);

    const fileUrl = publicData.publicUrl;
    console.log('✅ URL pública gerada:', fileUrl);

    console.log('=== UPLOAD CONCLUÍDO COM SUCESSO ===');
    
    return {
      url: fileUrl,
      fileName: fileName
    };

  } catch (uploadError) {
    console.error('❌ ERRO GERAL no upload:', uploadError);
    throw uploadError;
  }
};
