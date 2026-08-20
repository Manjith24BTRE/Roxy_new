export interface ReportData {
  category: string;
  subject: string;
  description: string;
  email: string;
  attachment?: File;
}

/**
 * A simulated service for submitting problem reports.
 * In a real backend environment, this would call Supabase or an API.
 */
export async function submitReport(data: ReportData): Promise<{ success: boolean; message?: string }> {
  console.log("Submitting report payload:", data);
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Basic server-side simulated validation
  if (!data.category || !data.subject || !data.description || !data.email) {
    return { success: false, message: "Missing required fields." };
  }
  
  if (data.description.length > 5000) {
    return { success: false, message: "Description exceeds maximum length." };
  }

  // Simulate success
  return { success: true };
}
