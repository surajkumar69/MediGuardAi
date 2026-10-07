"use client";

import { UploadCloud, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { useCallback, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  onManualEntry?: () => void;
  isLoading?: boolean;
}

export function UploadBox({ onFileSelect, onManualEntry, isLoading }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "w-full rounded-2xl border-2 border-dashed transition-all duration-200",
        isDragging ? "border-primary bg-primary/5" : "border-slate-300 bg-slate-50/50 hover:bg-slate-50"
      )}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/jpg,application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <UploadCloud className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload Prescription</h3>
        <p className="text-slate-500 mb-8 max-w-sm">
          Drag and drop your prescription image or PDF here, or click to browse files.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button 
            className="rounded-full px-8 shadow-md" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            Browse Files
          </Button>
          <Button 
            variant="secondary" 
            className="rounded-full px-8" 
            disabled={isLoading}
            onClick={onManualEntry}
          >
            <FileText className="mr-2 h-4 w-4" />
            Enter Medicines Manually
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-6">
          Supported formats: JPG, PNG, PDF (Max 10MB)
        </p>
      </div>
    </div>
  );
}
