
import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  fileName: string;
}

export const uploadFile = async (
  file: File, 
  mediaType: 'photo' | 'audio' | 'video'
): Promise<UploadResult> => {
  console.log('Iniciando upload do arquivo:', file.name);

  // Validar tipo de arquivo
  const allowedTypes = {
    photo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    video: ['video/mp4', 'video/webm', 'video/quicktime']
  };

  if (!allowedTypes[mediaType].includes(file.type)) {
    throw new Error(`Tipo de arquivo não permitido para ${mediaType}`);
  }

  // Validar tamanho do arquivo (50MB máximo)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Tamanho máximo: 50MB');
  }

  // Gerar nome único para o arquivo
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2);
  const fileExtension = file.name.split('.').pop();
  const fileName = `${mediaType}/${timestamp}_${randomId}.${fileExtension}`;

  console.log('Nome do arquivo gerado:', fileName);

  // Fazer upload para o Supabase Storage
  const { data, error } = await supabase.storage
    .from('message-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Erro no upload:', error);
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }

  console.log('Upload realizado com sucesso:', data);

  // Obter URL pública do arquivo
  const { data: publicData } = supabase.storage
    .from('message-media')
    .getPublicUrl(fileName);

  const fileUrl = publicData.publicUrl;
  console.log('URL pública gerada:', fileUrl);

  return {
    url: fileUrl,
    fileName: fileName
  };
};
