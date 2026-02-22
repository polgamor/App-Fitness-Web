import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  storage
} from '../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { calculateAge } from '../core/utils/date.utils';
import type { Trainer, TrainerUpdateData } from '../core/types/trainer.types';
import type { Client } from '../core/types/client.types';

export type { Client };

interface AuthContextType {
  user: Trainer | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  loading: boolean;
  deleteAccount: (password: string) => Promise<void>;
  reauthenticate: (password: string) => Promise<void>;
  updateProfile: (userId: string, updatedData: TrainerUpdateData) => Promise<boolean>;
  sendVerificationEmail: () => Promise<void>;
  isEmailVerified: boolean;
  checkEmailVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const fetchUserData = async (uid: string): Promise<Trainer> => {
    try {
      const trainerRef = doc(db, 'entrenadores', uid);
      const trainerDoc = await getDoc(trainerRef);

      if (!trainerDoc.exists()) {
        throw new Error(`No trainer found with ID: ${uid}`);
      }

      const trainerData = trainerDoc.data();

      const q = query(collection(db, 'clientes'), where('entrenador_ID', '==', uid));
      const clientsSnapshot = await getDocs(q);

      const clients: Client[] = clientsSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          firstName: data.nombre,
          lastName: data.apellido,
          secondLastName: data.apellido2,
          email: data.email,
          birthDate: data.fechaNacimiento,
          age: data.fechaNacimiento ? calculateAge(data.fechaNacimiento) : 0,
          isActive: data.activo,
          trainerId: data.entrenador_ID,
          phone: data.telefono,
          goal: data.objetivo,
          height: data.altura,
          weight: data.peso,
          profilePhoto: data.foto_perfil
        } as Client;
      });

      return {
        id: uid,
        email: trainerData.email,
        firstName: trainerData.nombre,
        lastName: trainerData.apellido,
        secondLastName: trainerData.apellido2,
        age: trainerData.edad || 0,
        isActive: trainerData.activo,
        phone: trainerData.telefono,
        address: trainerData.direccion,
        postalCode: trainerData.codigoPostal,
        city: trainerData.ciudad,
        company: trainerData.empresa,
        role: trainerData.rol,
        companyCity: trainerData.ciudadEmpresa,
        specialty: trainerData.especialidad,
        yearsOfExperience: trainerData.experiencia || 0,
        biography: trainerData.biografia,
        profilePictureUrl: trainerData.fotoPerfilUrl,
        clients
      };
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(result.user.uid);

      if (userData.role !== 'entrenador') {
        await signOut(auth);
        throw new Error('auth/unauthorized-role');
      }

      setUser(userData);
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'entrenadores', userCredential.user.uid), {
        email,
        nombre: firstName,
        apellido: lastName,
        activo: true,
        emailVerified: false,
        fechaRegistro: new Date(),
        rol: 'entrenador'
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      setLoading(true);

      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      await reauthenticate(password);

      const userId = auth.currentUser.uid;
      await deleteDoc(doc(db, 'entrenadores', userId));
      await deleteUser(auth.currentUser);

      setUser(null);
    } catch (error) {
      console.error('Account deletion failed:', error);
      if (error instanceof Error) {
        throw new Error(
          'code' in error && (error as any).code === 'auth/wrong-password'
            ? 'Incorrect password'
            : 'Failed to delete account. Please try again.'
        );
      } else {
        throw new Error('Unknown error while deleting account');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userId: string, updatedData: TrainerUpdateData) => {
    try {
      setLoading(true);
      const trainerRef = doc(db, 'entrenadores', userId);

      let profilePictureUrl = updatedData.profilePictureUrl;
      if (updatedData.profilePictureFile) {
        try {
          const storageRef = ref(storage, `profileImages/${userId}`);
          await uploadBytes(storageRef, updatedData.profilePictureFile);
          profilePictureUrl = await getDownloadURL(storageRef);
        } catch (uploadError) {
          console.error('Profile image upload failed:', uploadError);
          throw new Error('Failed to update profile picture');
        }
      }

      const firestorePayload: Record<string, unknown> = {
        nombre: updatedData.firstName,
        apellido: updatedData.lastName,
        apellido2: updatedData.secondLastName,
        edad: updatedData.age,
        telefono: updatedData.phone,
        direccion: updatedData.address,
        codigoPostal: updatedData.postalCode,
        ciudad: updatedData.city,
        empresa: updatedData.company,
        ciudadEmpresa: updatedData.companyCity,
        especialidad: updatedData.specialty,
        experiencia: updatedData.yearsOfExperience,
        biografia: updatedData.biography,
        fotoPerfilUrl: profilePictureUrl,
        activo: updatedData.isActive,
        lastUpdated: new Date()
      };

      // Remove undefined values before sending to Firestore
      const cleanPayload = Object.fromEntries(
        Object.entries(firestorePayload).filter(([, v]) => v !== undefined)
      );

      await updateDoc(trainerRef, cleanPayload);

      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...updatedData,
          profilePictureUrl,
          id: prev.id,
          email: prev.email,
          clients: prev.clients || []
        };
      });

      return true;
    } catch (error) {
      console.error('Profile update failed:', { error, userId, updatedData });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reauthenticate = async (password: string) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('No authenticated user');
    }

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );

    await reauthenticateWithCredential(auth.currentUser, credential);
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    await sendEmailVerification(auth.currentUser, {
      url: window.location.origin + '/verify-success',
      handleCodeInApp: true
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          setLoading(true);
          await firebaseUser.reload();
          setIsEmailVerified(firebaseUser.emailVerified);
          const userData = await fetchUserData(firebaseUser.uid);
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setIsEmailVerified(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkEmailVerification = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      return auth.currentUser.emailVerified;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      loading,
      deleteAccount,
      updateProfile,
      reauthenticate,
      sendVerificationEmail,
      isEmailVerified,
      checkEmailVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
