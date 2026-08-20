import React, { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { submitReport, ReportData } from '../../../../services/reportService';

interface Props {
  onSuccess: () => void;
}

export default function ReportProblemForm({ onSuccess }: Props) {
  const [formData, setFormData] = useState<ReportData>({
    category: '',
    subject: '',
    description: '',
    email: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ReportData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.category) newErrors.category = "Please select a category.";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required.";
    else if (formData.subject.length > 120) newErrors.subject = "Subject must be 120 characters or less.";
    
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    else if (formData.description.length > 5000) newErrors.description = "Description must be 5000 characters or less.";
    
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Please enter a valid email address.";

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
        setSubmitError(res.message || "Failed to submit report. Please try again.");
      }
    } catch (err) {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
          {submitError}
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
        <label htmlFor="description" className="block text-sm font-semibold text-[#1D2B64] mb-2">Description *</label>
        <textarea 
          id="description"
          rows={5}
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
        <div className="border-2 border-dashed border-[#1D2B64]/20 rounded-xl p-8 flex flex-col items-center justify-center bg-[#FAFAFC] hover:bg-[#F8FBFD] transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1D2B64]/40 group-hover:text-[#3B6CE7] shadow-sm mb-3 transition-colors">
            <Paperclip size={18} />
          </div>
          <span className="text-sm font-medium text-[#1D2B64]/60 group-hover:text-[#1D2B64]">Add screenshot</span>
          <span className="text-xs text-[#1D2B64]/40 mt-1">PNG, JPG, WebP up to 10MB</span>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#3B6CE7] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#2555CC] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            "Submitting..."
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
