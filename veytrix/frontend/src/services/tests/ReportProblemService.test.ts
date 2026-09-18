import { describe, it, expect } from 'vitest';
import { validateAttachmentFile } from '../reportService';

describe('ReportProblemService - Attachment File Validation', () => {
  it('should accept valid PNG, JPG, WebP, and PDF files within 10MB limit', () => {
    const validPng = new File(['dummy content'], 'screenshot.png', { type: 'image/png' });
    const validJpg = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });
    const validWebp = new File(['dummy content'], 'image.webp', { type: 'image/webp' });
    const validPdf = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });

    expect(validateAttachmentFile(validPng)).toEqual({ valid: true });
    expect(validateAttachmentFile(validJpg)).toEqual({ valid: true });
    expect(validateAttachmentFile(validWebp)).toEqual({ valid: true });
    expect(validateAttachmentFile(validPdf)).toEqual({ valid: true });
  });

  it('should reject files exceeding 10MB limit', () => {
    // 11MB file
    const oversizedBuffer = new ArrayBuffer(11 * 1024 * 1024);
    const oversizedFile = new File([oversizedBuffer], 'large_screen.png', { type: 'image/png' });

    const result = validateAttachmentFile(oversizedFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10MB');
  });

  it('should reject unsupported file extensions and MIME types', () => {
    const invalidExe = new File(['executable'], 'virus.exe', { type: 'application/x-msdownload' });
    const invalidZip = new File(['archive'], 'data.zip', { type: 'application/zip' });

    expect(validateAttachmentFile(invalidExe).valid).toBe(false);
    expect(validateAttachmentFile(invalidZip).valid).toBe(false);
  });
});
