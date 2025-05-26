
import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  fileName: string;
}

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

  // Para áudio, garantir que seja em formato suportado pelo Supabase
  if (mediaType === 'audio') {
    console.log('Processando arquivo de áudio...');
    
    if (file.type.includes('webm')) {
      // WebM é suportado pelo Supabase
      finalMimeType = 'audio/webm';
      finalExtension = 'webm';
    } else if (file.type.includes('wav')) {
      finalMimeType = 'audio/wav';
      finalExtension = 'wav';
    } else if (file.type.includes('ogg')) {
      finalMimeType = 'audio/ogg';
      finalExtension = 'ogg';
    } else {
      // Fallback para WebM se o tipo não for reconhecido
      finalMimeType = 'audio/webm';
      finalExtension = 'webm';
    }
    
    console.log('Tipo MIME final para áudio:', finalMimeType);
  } else {
    // Para outros tipos, extrair extensão normalmente
    if (file.name && file.name.includes('.')) {
      finalExtension = file.name.split('.').pop() || '';
    } else {
      const mimeToExtension: { [key: string]: string } = {
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
      'audio/webm',
      'audio/wav', 
      'audio/ogg'
    ],
    video: ['video/mp4', 'video/webm', 'video/quicktime']
  };

  if (!allowedTypes[mediaType].includes(finalMimeType)) {
    console.error('❌ ERRO: Tipo de arquivo não permitido:', finalMimeType, 'Para mídia:', mediaType);
    throw new Error(`Tipo de arquivo não permitido para ${mediaType}: ${finalMimeType}`);
  }

  console.log('✅ Arquivo de áudio aceito para upload');

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
