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

export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  apellido2?: string;
  email: string;
  fechaNacimiento: string; 
  activo: boolean;
  entrenador_ID: string;
  telefono: number;
  foto_perfil: string;
  objetivo: number;
  peso: number;
  altura: number;
}

// Interface para manejar los datos del entrenador
interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  apellido2?: string;
  edad: number;
  activo: boolean;
  telefono?: string;
  direccion?: string;
  codigoPostal?: string;
  ciudad?: string;
  empresa?: string;
  ciudadEmpresa?: string;
  especialidad?: string;
  experiencia?: number;
  biografia?: string;
  rol?: string;
  fotoPerfilUrl?: string;
  clientes?: Cliente[];
}

// Datos actualizados
interface UserUpdateData extends Partial<Omit<User, 'id' | 'email' | 'clientes'>> {
  fotoPerfilFile?: File | Blob;
}

// Interface que especifica que provee el authcontext
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, nombre: string, apellido: string) => Promise<void>;
  loading: boolean;
  deleteAccount: (password: string) => Promise<void>;
  reauthenticate: (password: string) => Promise<void>;
  updateProfile: (userId: string, updatedData: UserUpdateData) => Promise<boolean>;
  sendVerificationEmail: () => Promise<void>; 
  isEmailVerified: boolean; 
  checkEmailVerification: () => Promise<boolean>;
}

// Creacion del contexto de valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente Authprovider
// User: Almacena los datos del usuario autentificado
// Loading: Indica cuando hay operaciones en curso
// isEmailVerified: Estado de verificacion del email
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Obtiene datos del entrenador y sus clientes desde Firestore
  // Retorna un objeto User con toda la información
  const fetchUserData = async (uid: string) => {
    try {
      const entrenadorRef = doc(db, 'entrenadores', uid);
      const entrenadorDoc = await getDoc(entrenadorRef);
      
      if (!entrenadorDoc.exists()) {
        throw new Error(`No existe entrenador con ID: ${uid}`);
      }
      
      const entrenadorData = entrenadorDoc.data();
      
      const q = query(collection(db, 'clientes'), where('entrenador_ID', '==', uid));
      const clientesSnapshot = await getDocs(q);
      
      const clientes = clientesSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Función para calcular la edad
        const calcularEdad = (fechaNacimiento: string) => {
          const hoy = new Date();
          const nacimiento = new Date(fechaNacimiento);
          let edad = hoy.getFullYear() - nacimiento.getFullYear();
          const mes = hoy.getMonth() - nacimiento.getMonth();
          
          if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
          }
          
          return edad;
        };
        
        return {
          id: doc.id,
          nombre: data.nombre,
          apellido: data.apellido,
          apellido2: data.apellido2,
          email: data.email,
          fechaNacimiento: data.fechaNacimiento,
          edad: data.fechaNacimiento ? calcularEdad(data.fechaNacimiento) : 0,
          activo: data.activo,
          entrenador_ID: data.entrenador_ID,
          telefono: data.telefono,
          objetivo: data.objetivo,
          altura: data.altura,
          peso: data.peso,
          foto_perfil: data.foto_perfil
        } as Cliente;
      });
    
      return {
        id: uid,
        email: entrenadorData.email,
        nombre: entrenadorData.nombre,
        apellido: entrenadorData.apellido,
        apellido2: entrenadorData.apellido2,
        edad: entrenadorData.edad || 0,
        activo: entrenadorData.activo,
        telefono: entrenadorData.telefono,
        direccion: entrenadorData.direccion,
        codigoPostal: entrenadorData.codigoPostal,
        ciudad: entrenadorData.ciudad,
        empresa: entrenadorData.empresa,
        rol: entrenadorData.rol,
        ciudadEmpresa: entrenadorData.ciudadEmpresa,
        especialidad: entrenadorData.especialidad,
        experiencia: entrenadorData.experiencia || 0,
        biografia: entrenadorData.biografia,
        fotoPerfilUrl: entrenadorData.fotoPerfilUrl,
        clientes
      };
    } catch (error) {
      console.error("Error al obtener datos:", error);
      throw error;
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(result.user.uid);

      if (userData.rol !== 'entrenador') {
        await signOut(auth);
        throw new Error('auth/unauthorized-role');
      }
      
      setUser(userData);
    } catch (err) {
      console.error("Error en login:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  // Registrer
  const register = async (email: string, password: string, nombre: string, apellido: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'entrenadores', userCredential.user.uid), {
        email,
        nombre,
        apellido,
        activo: true,
        emailVerified: false, 
        fechaRegistro: new Date(),
        rol: 'entrenador'
      });
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Borrar la cuenta
  const deleteAccount = async (password: string) => {
    try {
      setLoading(true);
      
      // Detecta si el usuario esta autentificado
      if (!auth.currentUser) {
        throw new Error('No hay usuario autenticado');
      }
      // Autentifica al usuario
      await reauthenticate(password);
      
      const userId = auth.currentUser.uid;
      
      // Borra datos de Firebase
      await deleteDoc(doc(db, 'entrenadores', userId));
      await deleteUser(auth.currentUser);
      
      setUser(null);
      
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      if (error instanceof Error) {
        throw new Error(
          'code' in error && error.code === 'auth/wrong-password' 
            ? 'Contraseña incorrecta' 
            : 'Error al eliminar la cuenta. Por favor intenta nuevamente.'
        );
      } else {
        throw new Error('Error desconocido al eliminar la cuenta');
      }
    } finally {
      setLoading(false);
    }
  };

  // Modificar usuario
  const updateProfile = async (userId: string, updatedData: UserUpdateData) => {
    try {
      setLoading(true);
      const entrenadorRef = doc(db, 'entrenadores', userId);
  
      // 1. Manejo de imagen
      let fotoPerfilUrl = updatedData.fotoPerfilUrl;
      if (updatedData.fotoPerfilFile) {
        try {
          const storageRef = ref(storage, `profileImages/${userId}`);
          await uploadBytes(storageRef, updatedData.fotoPerfilFile);
          fotoPerfilUrl = await getDownloadURL(storageRef);
        } catch (uploadError) {
          console.error("Error al subir imagen:", uploadError);
          throw new Error("No se pudo actualizar la imagen de perfil");
        }
      }
  
      // 2. Preparar datos para Firestore
      const updateData: Partial<User> & { lastUpdated: Date } = {
        ...updatedData,
        fotoPerfilUrl,
        lastUpdated: new Date()
      };
  
      // 3. Crear objeto seguro para Firestore
      const firestoreUpdate: Record<string, any> = {};
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && key !== 'fotoPerfilFile') {
          firestoreUpdate[key] = value;
        }
      });
  
      // 4. Actualizar Firestore
      await updateDoc(entrenadorRef, firestoreUpdate);
  
      // 5. Actualizar estado local
      setUser(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          ...firestoreUpdate,
          id: prev.id,
          email: prev.email,
          clientes: prev.clientes || []
        };
      });
  
      return true;
    } catch (error) {
      console.error("Error al actualizar perfil:", {
        error,
        userId,
        updatedData
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Verifica credenciales antes de operaciones sensibles
  const reauthenticate = async (password: string) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('Usuario no autenticado');
    }
    
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );
    
    await reauthenticateWithCredential(auth.currentUser, credential);
  };

  // Envía correo de verificación usando Firebase
  const sendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error('Usuario no autenticado');
    await sendEmailVerification(auth.currentUser, {
      url: window.location.origin + '/verificacion-exitosa',
      handleCodeInApp: true
    });
  };

  // Actualiza isEmailVerified y carga datos del usuario
  // En el useEffect de onAuthStateChanged
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setLoading(true);
          await user.reload(); // Recarga el estado más reciente
          setIsEmailVerified(user.emailVerified);
          const userData = await fetchUserData(user.uid);
          setUser(userData);
        } catch (error) {
          console.error("Error al cargar datos:", error);
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

  // Sincronización
  const checkEmailVerification = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      return auth.currentUser.emailVerified;
    }
    return false;
  };

  // Provider del context
  return (
    <AuthContext.Provider value=
    {{ 
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

// Hook para acceder al contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}