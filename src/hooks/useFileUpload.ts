
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FileUploadState {
  isUploading: boolean;
  uploadProgress: number;
  fileUrl: string | null;
  fileName: string | null;
  error: string | null;
}

export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    isUploading: false,
    uploadProgress: 0,
    fileUrl: null,
    fileName: null,
    error: null,
  });
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<{ url: string; fileName: string } | null> => {
    try {
      setUploadState({
        isUploading: true,
        uploadProgress: 0,
        fileUrl: null,
        fileName: null,
        error: null,
      });

      // Validar tipo de arquivo
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'video/mp4', 'video/webm', 'video/quicktime'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado');
      }

      // Validar tamanho (50MB)
      if (file.size > 52428800) {
        throw new Error('Arquivo muito grande. Máximo 50MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      console.log('Uploading file:', fileName);
      
      const { data, error } = await supabase.storage
        .from('message-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('message-media')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      setUploadState({
        isUploading: false,
        uploadProgress: 100,
        fileUrl: publicUrl,
        fileName: fileName,
        error: null,
      });

      toast({
        title: "Upload concluído!",
        description: "Arquivo enviado com sucesso.",
      });

      return { url: publicUrl, fileName: fileName };

    } catch (error) {
      console.error('File upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload';
      
      setUploadState({
        isUploading: false,
        uploadProgress: 0,
        fileUrl: null,
        fileName: null,
        error: errorMessage,
      });

      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    }
  };

  const resetUpload = () => {
    setUploadState({
      isUploading: false,
      uploadProgress: 0,
      fileUrl: null,
      fileName: null,
      error: null,
    });
  };

  return {
    uploadState,
    uploadFile,
    resetUpload,
  };
};
