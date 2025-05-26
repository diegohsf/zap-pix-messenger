
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

  // Validar tipo de arquivo com logs detalhados
  const allowedTypes = {
    photo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    audio: [
      'audio/mpeg', 
      'audio/wav', 
      'audio/ogg', 
      'audio/mp4', 
      'audio/x-m4a', 
      'audio/webm',
      'audio/mp3'
    ],
    video: ['video/mp4', 'video/webm', 'video/quicktime']
  };

  console.log('Tipos permitidos para', mediaType, ':', allowedTypes[mediaType]);
  console.log('Tipo do arquivo aceito?', allowedTypes[mediaType].includes(file.type));

  if (!allowedTypes[mediaType].includes(file.type)) {
    console.error('❌ ERRO: Tipo de arquivo não permitido:', file.type, 'Para mídia:', mediaType);
    throw new Error(`Tipo de arquivo não permitido para ${mediaType}: ${file.type}`);
  }

  // Validar tamanho do arquivo (50MB máximo)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    console.error('❌ ERRO: Arquivo muito grande:', file.size, 'bytes');
    throw new Error('Arquivo muito grande. Tamanho máximo: 50MB');
  }

  // Tratar extensão do arquivo
  let fileExtension = '';
  
  if (file.name && file.name.includes('.')) {
    fileExtension = file.name.split('.').pop() || '';
    console.log('Extensão extraída do nome:', fileExtension);
  } else {
    // Para arquivos sem extensão (como gravações de áudio), determinar pela MIME type
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
    
    fileExtension = mimeToExtension[file.type] || 'bin';
    console.log('Extensão determinada pelo MIME type:', fileExtension);
  }

  // Gerar nome único para o arquivo
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2);
  const fileName = `${mediaType}/${timestamp}_${randomId}.${fileExtension}`;

  console.log('Nome final do arquivo:', fileName);

  try {
    console.log('Iniciando upload para Supabase Storage...');
    
    // Fazer upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('message-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
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
