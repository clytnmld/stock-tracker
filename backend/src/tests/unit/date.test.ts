import { describe, it, expect } from 'vitest';
import { formatDateToJakarta } from '../../utils/dateFormat';

describe('formatDateToJakarta', () => {
  it("should format date to 'YYYY-MM-DD HH:mm:ss' in Asia/Jakarta timezone", () => {
    const date = new Date('2024-11-07T00:00:00Z'); // UTC time
    expect(formatDateToJakarta(date)).toBe('2024-11-07 07:00:00'); // Jakarta is UTC+7
  });
});
