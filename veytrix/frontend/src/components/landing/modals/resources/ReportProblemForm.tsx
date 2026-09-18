import React, { useState, useRef } from 'react';
import { Paperclip, Send, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { submitReport, ReportData, validateAttachmentFile } from '../../../../services/reportService';

interface Props {
  onSuccess: () => void;
}

export default function ReportProblemForm({ onSuccess }: Props) {
  const [formData, setFormData] = useState<ReportData>({
    category: '',
    subject: '',
    description: '',
    email: '',
    priority: 'Medium',
    attachment: null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ReportData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    setFileError(null);
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setFormData(prev => ({ ...prev, attachment: null }));
      return;
    }

    const validation = validateAttachmentFile(file);
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid file.');
      return;
    }

    setSelectedFile(file);
    setFormData(prev => ({ ...prev, attachment: file }));

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  const removeSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    setFormData(prev => ({ ...prev, attachment: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.category) newErrors.category = 'Please select a category.';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required.';
    else if (formData.subject.length > 120) newErrors.subject = 'Subject must be 120 characters or less.';

    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    else if (formData.description.length > 5000) newErrors.description = 'Description must be 5000 characters or less.';

    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitReport(formData);
      if (res.success) {
        onSuccess();
      } else {
        setSubmitError(res.message || 'Failed to submit report. Please try again.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center justify-between">
          <span>{submitError}</span>
          <button type="button" onClick={() => setSubmitError(null)} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-[#1D2B64] mb-2">Category *</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => {
              setFormData({ ...formData, category: e.target.value });
              if (errors.category) setErrors({ ...errors, category: undefined });
            }}
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? "category-error" : undefined}
            className={`w-full bg-[#FAFAFC] border ${errors.category ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-[#1D2B64]/10 focus:border-[#3B6CE7]'} rounded-xl px-4 py-3 text-sm text-[#1D2B64] focus:outline-none transition-colors`}
          >
            <option value="" disabled>Select category...</option>
            <option value="Editor Issue">Editor Issue</option>
            <option value="Import / Upload Issue">Import / Upload Issue</option>
            <option value="Export Issue">Export Issue</option>
            <option value="Account Issue">Account Issue</option>
            <option value="Template Issue">Template Issue</option>
            <option value="Performance Issue">Performance Issue</option>
            <option value="UI / Display Issue">UI / Display Issue</option>
            <option value="Bug">Bug</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <p id="category-error" className="mt-1 text-xs text-red-500">{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-[#1D2B64] mb-2">Subject *</label>
          <input
            id="subject"
            type="text"
            placeholder="Briefly describe the issue"
            value={formData.subject}
            onChange={(e) => {
              setFormData({ ...formData, subject: e.target.value });
              if (errors.subject) setErrors({ ...errors, subject: undefined });
            }}
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? "subject-error" : undefined}
            className={`w-full bg-[#FAFAFC] border ${errors.subject ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-[#1D2B64]/10 focus:border-[#3B6CE7]'} rounded-xl px-4 py-3 text-sm text-[#1D2B64] focus:outline-none transition-colors`}
          />
          {errors.subject && <p id="subject-error" className="mt-1 text-xs text-red-500">{errors.subject}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[#1D2B64] mb-2">Email *</label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`w-full bg-[#FAFAFC] border ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-[#1D2B64]/10 focus:border-[#3B6CE7]'} rounded-xl px-4 py-3 text-sm text-[#1D2B64] focus:outline-none transition-colors`}
          />
          {errors.email && <p id="email-error" className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-semibold text-[#1D2B64] mb-2">Priority</label>
          <select
            id="priority"
            value={formData.priority || 'Medium'}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full bg-[#FAFAFC] border border-[#1D2B64]/10 focus:border-[#3B6CE7] rounded-xl px-4 py-3 text-sm text-[#1D2B64] focus:outline-none transition-colors"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-[#1D2B64] mb-2">Description *</label>
        <textarea
          id="description"
          rows={4}
          placeholder="Tell us what happened..."
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
            if (errors.description) setErrors({ ...errors, description: undefined });
          }}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "description-error" : undefined}
          className={`w-full bg-[#FAFAFC] border ${errors.description ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-[#1D2B64]/10 focus:border-[#3B6CE7]'} rounded-xl px-4 py-3 text-sm text-[#1D2B64] focus:outline-none transition-colors resize-y`}
        />
        {errors.description && <p id="description-error" className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1D2B64] mb-2">Attachment</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          id="attachment-file-input"
        />

        {selectedFile ? (
          <div className="border border-[#3B6CE7]/30 bg-[#E6F2F8]/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#3B6CE7]/10 flex items-center justify-center text-[#3B6CE7] flex-shrink-0">
                  <FileText size={24} />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1D2B64] truncate">{selectedFile.name}</p>
                <p className="text-xs text-[#1D2B64]/60">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeSelectedFile}
              className="p-1.5 rounded-lg bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-500 border border-gray-200 transition"
              title="Remove attachment"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed ${isDragging ? 'border-[#3B6CE7] bg-[#E6F2F8]/50' : 'border-[#1D2B64]/20 bg-[#FAFAFC] hover:bg-[#F8FBFD]'} rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer group`}
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1D2B64]/40 group-hover:text-[#3B6CE7] shadow-sm mb-2 transition-colors">
              <Paperclip size={18} />
            </div>
            <span className="text-sm font-medium text-[#1D2B64]/80 group-hover:text-[#3B6CE7]">
              Click to select or drag and drop attachment
            </span>
            <span className="text-xs text-[#1D2B64]/40 mt-1">PNG, JPG, WebP, PDF up to 10MB</span>
          </div>
        )}

        {fileError && <p className="mt-1.5 text-xs text-red-500">{fileError}</p>}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#3B6CE7] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#2555CC] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Submitting Report...
            </>
          ) : (
            <>
              <Send size={16} /> Submit Report
            </>
          )}
        </button>
      </div>
    </form>
  );
}
