'use client';

import {useState} from 'react';
import {Button} from './button';
import {File, Paperclip} from 'lucide-react';

interface FileUploadProps {
  onChange: (file: File | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({onChange}) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setFileName(file.name);
      onChange(file);
    } else {
      setFileName(null);
      onChange(null);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <label
        htmlFor="report-upload"
        className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Paperclip className="mr-2 h-4 w-4"/>
        {fileName || 'Upload Report'}
        <input
          type="file"
          id="report-upload"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};
