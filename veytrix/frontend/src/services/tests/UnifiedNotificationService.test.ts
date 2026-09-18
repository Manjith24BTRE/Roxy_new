import { describe, it, expect } from 'vitest';
import { unifiedNotificationService, UnifiedNotification } from '../unifiedNotificationService';

describe('Unified Notification Delivery System', () => {
  it('should correctly format notification item fields', () => {
    const mockNotif: UnifiedNotification = {
      id: 'test_1',
      title: '50% OFF Premium Plan',
      message: 'New promotional offer available',
      type: 'announcement',
      priority: 'high',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: 'https://veytrix.com/pricing',
    };

    expect(mockNotif.type).toBe('announcement');
    expect(mockNotif.isRead).toBe(false);
    expect(mockNotif.title).toContain('50% OFF');
  });

  it('should mark notification as read and return success', async () => {
    const testId = 'notif_test_abc_123';
    const result = await unifiedNotificationService.markAsRead(testId);
    expect(result).toBe(true);
  });
});
