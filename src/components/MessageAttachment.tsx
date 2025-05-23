
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileIcon, ImageIcon, VideoIcon, Paperclip, X } from 'lucide-react';
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
      // Generate a unique file name to prevent collisions
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(`messages/${fileName}`, file);
        
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      // Get the public URL
      const { data: publicURLData } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(`messages/${fileName}`);
      
      if (!publicURLData || !publicURLData.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      // Determine file type
      let fileType = 'file';
      if (file.type.startsWith('image/')) fileType = 'image';
      else if (file.type.startsWith('video/')) fileType = 'video';
      else if (file.type.startsWith('audio/')) fileType = 'audio';
      
      onAttach(publicURLData.publicUrl, fileType);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('File upload error:', error);
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
