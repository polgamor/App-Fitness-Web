export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  birthDate: string;
  isActive: boolean;
  trainerId: string;
  phone: number;
  profilePhoto: string;
  goal: number;
  weight: number;
  height: number;
}
