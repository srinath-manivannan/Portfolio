import { useState } from 'react';
import { Upload, X, File, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket: string;
  accept?: string;
  multiple?: boolean;
  value?: string[];
  onChange: (urls: string[]) => void;
  maxSize?: number; // in MB
  label?: string;
}

export function FileUpload({
  bucket,
  accept = 'image/*',
  multiple = false,
  value = [],
  onChange,
  maxSize = 5,
  label = 'Upload files'
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Max size: ${maxSize}MB`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      onChange([...value, ...uploadedUrls]);
      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (urlToRemove: string) => {
    onChange(value.filter(url => url !== urlToRemove));
  };

  const getFileIcon = (url: string) => {
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <FileImage className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="relative cursor-pointer">
          <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-sm">{uploading ? 'Uploading...' : label}</span>
          </div>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative group rounded-lg border border-border overflow-hidden"
            >
              {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-muted">
                  {getFileIcon(url)}
                  <span className="text-xs ml-2 truncate max-w-[100px]">
                    {url.split('/').pop()}
                  </span>
                </div>
              )}
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(url)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
