
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
    onFileProcess: (file: File) => void;
    disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileProcess, disabled }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            onFileProcess(files[0]);
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if(!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if(!disabled) {
            const files = e.dataTransfer.files;
            handleFileChange(files);
        }
    }, [disabled]);

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors duration-200 ${
                isDragging ? 'border-cyan-400 bg-slate-700' : 'border-slate-600 bg-slate-800'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileChange(e.target.files)}
                accept="image/png, image/jpeg, image/webp, application/pdf"
                disabled={disabled}
            />
            <div className="text-center">
                <UploadIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <p className="font-semibold text-slate-300">
                    <span className="text-cyan-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP, or PDF</p>
            </div>
        </div>
    );
};
