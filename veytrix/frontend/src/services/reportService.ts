import { supabase, supabaseAdmin } from '../lib/supabase';

export interface ReportData {
  category: string;
  subject: string;
  description: string;
  email: string;
  priority?: string;
  attachment?: File | null;
}

const BUCKET_NAME = 'support-attachments';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];

export function validateAttachmentFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds maximum allowed limit of 10MB.' };
  }

  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
  const isTypeAllowed =
    ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) || ALLOWED_EXTENSIONS.includes(fileExt);

  if (!isTypeAllowed) {
    return {
      valid: false,
      error: 'Invalid file format. Supported formats: PNG, JPG, JPEG, WebP, PDF.',
    };
  }

  return { valid: true };
}

/**
 * Ensures the `support-attachments` bucket exists in Supabase Storage.
 */
async function ensureBucketExists(): Promise<void> {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (!exists) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE_BYTES,
      });
    }
  } catch (err) {
    console.warn('Bucket verification warning:', err);
  }
}

/**
 * Submits a problem report by uploading attachment to Supabase Storage
 * and persisting ticket data to public.support_tickets.
 */
export async function submitReport(
  data: ReportData
): Promise<{ success: boolean; message?: string; ticketId?: string }> {
  try {
    // 1. Validate required fields
    if (!data.category || !data.subject || !data.description || !data.email) {
      return { success: false, message: 'Please fill out all required fields.' };
    }

    if (data.description.length > 5000) {
      return { success: false, message: 'Description exceeds maximum length of 5000 characters.' };
    }

    // 2. Validate attachment if provided
    if (data.attachment) {
      const validation = validateAttachmentFile(data.attachment);
      if (!validation.valid) {
        return { success: false, message: validation.error };
      }
    }

    // 3. Ensure bucket is ready
    await ensureBucketExists();

    // 4. Get active user context
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || 'anon_' + Math.random().toString(36).substring(2, 9);

    let attachmentUrl: string | null = null;
    let attachmentName: string | null = null;

    // 5. Upload file if attached
    if (data.attachment) {
      attachmentName = data.attachment.name;
      const cleanFileName = data.attachment.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${userId}/${Date.now()}_${cleanFileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(storagePath, data.attachment, {
          cacheControl: '3600',
          upsert: true,
          contentType: data.attachment.type || 'application/octet-stream',
        });

      if (uploadError) {
        console.error('Support attachment upload error:', uploadError);
        return {
          success: false,
          message: `Failed to upload attachment: ${uploadError.message}`,
        };
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      attachmentUrl = urlData?.publicUrl || null;
    }

    // 6. Insert record into public.support_tickets
    const ticketPayload = {
      user_id: authData?.user?.id || null,
      title: data.subject.trim(),
      description: data.description.trim(),
      category: data.category,
      email: data.email.trim(),
      priority: data.priority || 'Medium',
      status: 'open',
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let { data: insertedTicket, error: dbError } = await supabaseAdmin
      .from('support_tickets')
      .insert([ticketPayload])
      .select()
      .single();

    if (dbError) {
      console.warn('Primary database insert failed, attempting client fallback:', dbError);
      const fallbackRes = await supabase.from('support_tickets').insert([ticketPayload]).select().single();
      insertedTicket = fallbackRes.data;
      dbError = fallbackRes.error;
    }

    if (dbError) {
      console.error('Support ticket DB insertion error:', dbError);
      return {
        success: false,
        message: `Failed to save support ticket: ${dbError.message}`,
      };
    }

    return {
      success: true,
      ticketId: insertedTicket?.id,
    };
  } catch (err: any) {
    console.error('Unexpected report submission error:', err);
    return {
      success: false,
      message: err.message || 'An unexpected error occurred while submitting your report.',
    };
  }
}
