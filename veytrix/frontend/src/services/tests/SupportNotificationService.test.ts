import { describe, it, expect } from 'vitest';
import { emailNotificationService } from '../emailNotificationService';

describe('Support Notification System - Email & Notification Formatter', () => {
  it('should format resolution email subject and body correctly', () => {
    const { subject, textBody } = emailNotificationService.buildResolvedEmailBody(
      'Jane Creator',
      'Video Export Issue'
    );

    expect(subject).toBe('Support Ticket Resolved');
    expect(textBody).toContain('Hello Jane Creator');
    expect(textBody).toContain('"Video Export Issue"');
    expect(textBody).toContain('has been marked as resolved');
    expect(textBody).toContain('Veytrix Support Team');
  });

  it('should fall back to default user display name when empty', () => {
    const { textBody } = emailNotificationService.buildResolvedEmailBody(
      '',
      'Audio Waveform Bug'
    );

    expect(textBody).toContain('Hello Creator');
    expect(textBody).toContain('"Audio Waveform Bug"');
  });
});
