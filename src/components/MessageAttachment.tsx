
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileIcon, ImageIcon, Paperclip, VideoIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MessageAttachmentProps {
  onAttach: (url: string, type: string) => void;
}

export const MessageAttachment: React.FC<MessageAttachmentProps> = ({ onAttach }) => {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      // Check if the bucket exists, create if not
      const { error: bucketError } = await supabase.storage.getBucket('message-attachments');
      if (bucketError && bucketError.message.includes('not found')) {
        await supabase.storage.createBucket('message-attachments', {
          public: true,
          fileSizeLimit: 20971520, // 20MB
        });
        console.log('Created message-attachments bucket');
      }
      
      // Upload the file
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(`messages/${fileName}`, file);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: publicURL } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(`messages/${fileName}`);
      
      // Determine file type
      let fileType = 'file';
      if (file.type.startsWith('image/')) fileType = 'image';
      else if (file.type.startsWith('video/')) fileType = 'video';
      else if (file.type.startsWith('audio/')) fileType = 'audio';
      
      onAttach(publicURL.publicUrl, fileType);
    } catch (error: any) {
      toast.error(`File upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      // Clear the input
      e.target.value = '';
    }
  };
  
  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={uploading}
      >
        <Paperclip className={`h-5 w-5 ${uploading ? 'animate-pulse' : ''}`} />
      </Button>
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        disabled={uploading}
      />
    </div>
  );
};

interface AttachmentPreviewProps {
  url: string;
  type: string;
  onRemove?: () => void;
  className?: string;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ 
  url, 
  type, 
  onRemove,
  className = "max-w-sm" 
}) => {
  return (
    <div className={`relative rounded-md overflow-hidden border ${className}`}>
      {type === 'image' ? (
        <img src={url} alt="Attachment" className="w-full h-auto max-h-60 object-contain" />
      ) : type === 'video' ? (
        <video controls className="w-full h-auto max-h-60">
          <source src={url} />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="flex items-center p-4 gap-3">
          <FileIcon className="h-8 w-8 text-blue-500" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">
              {decodeURIComponent(url.split('/').pop() || '')}
            </p>
            <a 
              href={url} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              Download
            </a>
          </div>
        </div>
      )}
      
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
