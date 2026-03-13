import { useState, useRef } from 'react';
import { mediaAPI } from '../../api/endpoints';
import { useToast } from '../../contexts/ToastContext';
import { Upload, Loader2 } from 'lucide-react';

const FileUpload = ({ onUpload, type = 'image', label = 'Upload File', className = "" }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image' && !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (type === 'video' && !file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await mediaAPI.upload(formData);
      onUpload(res.data.data.url);
      toast.success('File uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={type === 'image' ? 'image/*' : 'video/*'}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current.click()}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-primary-300 transition-all disabled:opacity-50 min-h-[38px]"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {uploading ? 'Uploading...' : label}
      </button>
    </div>
  );
};

export default FileUpload;
