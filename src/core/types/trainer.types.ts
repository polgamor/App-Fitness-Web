import type { Client } from './client.types';

export interface Trainer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  age: number;
  isActive: boolean;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  company?: string;
  companyCity?: string;
  specialty?: string;
  yearsOfExperience?: number;
  biography?: string;
  role?: string;
  profilePictureUrl?: string;
  clients?: Client[];
}

export interface TrainerUpdateData extends Partial<Omit<Trainer, 'id' | 'email' | 'clients'>> {
  profilePictureFile?: File | Blob;
}
