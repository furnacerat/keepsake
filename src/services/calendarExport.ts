import type { Keepsake } from '../models/keepsake';

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function toIcsDate(date: string) {
  return date.replace(/-/g, '');
}

function getNextDate(date: string) {
  const nextDate = new Date(`${date}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);
  return nextDate.toISOString().slice(0, 10);
}

function toUtcStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function getFileName(title: string) {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'keepsake'}-unlock.ics`;
}

export function downloadUnlockCalendarEvent(keepsake: Keepsake) {
  if (!keepsake.unlockDate) {
    return;
  }

  const eventUrl = `${window.location.origin}/keepsakes/${keepsake.id}`;
  const eventTitle = `Unlock Keepsake: ${keepsake.title}`;
  const description = `Your Keepsake will be ready to open. ${eventUrl}`;
  const now = new Date();

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Keepsake//Keepsake Unlock Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${keepsake.id}@keepsake.local`,
    `DTSTAMP:${toUtcStamp(now)}`,
    `DTSTART;VALUE=DATE:${toIcsDate(keepsake.unlockDate)}`,
    `DTEND;VALUE=DATE:${toIcsDate(getNextDate(keepsake.unlockDate))}`,
    `SUMMARY:${escapeIcsText(eventTitle)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `URL:${eventUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = downloadUrl;
  link.download = getFileName(keepsake.title);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}
