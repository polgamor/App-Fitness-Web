import type { Timestamp } from 'firebase/firestore';

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function formatDate(date: Date | Timestamp | undefined): string {
  if (!date) return 'Date not available';
  if (date instanceof Date) return date.toLocaleDateString();
  if (typeof (date as Timestamp).toDate === 'function') {
    return (date as Timestamp).toDate().toLocaleDateString();
  }
  return 'Date not available';
}
