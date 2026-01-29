import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSuperAdmin: boolean;
  signUp: (email: string, password: string, businessName?: string) => Promise<{ error: Error | null; data?: User }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          // Check for superadmin role in Firestore
          // Structure: collection 'user_roles', docId = userId, field 'role' = 'superadmin'
          const roleDoc = await getDoc(doc(db, "user_roles", currentUser.uid));
          if (roleDoc.exists() && roleDoc.data().role === 'superadmin') {
            setIsSuperAdmin(true);
          } else {
            setIsSuperAdmin(false);
          }
        } catch (err) {
          console.error("Error fetching roles:", err);
          setIsSuperAdmin(false);
        }
      } else {
        setIsSuperAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, businessName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, "profiles", user.uid), {
        email: user.email,
        business_name: businessName || '',
        created_at: new Date().toISOString(),
        subscription_status: 'trial',
        ai_enabled: false,
        ai_model: 'gpt-4o-mini' // Default configuration
      });

      // Default role
      await setDoc(doc(db, "user_roles", user.uid), {
        role: 'client'
      });

      toast({
        title: "¡Bienvenido!",
        description: "Tu cuenta ha sido creada exitosamente.",
      });

      return { error: null, data: user };
    } catch (error: any) {
      console.error("Sign Up Error:", error);
      let message = "Error al registrarse";
      if (error.code === 'auth/email-already-in-use') message = "El correo ya está registrado";
      if (error.code === 'auth/weak-password') message = "La contraseña es muy débil";

      return { error: { ...error, message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      console.error("Sign In Error:", error);
      let message = "Error al iniciar sesión";
      if (error.code === 'auth/invalid-credential') message = "Credenciales incorrectas";
      if (error.code === 'auth/user-not-found') message = "Usuario no encontrado";
      if (error.code === 'auth/wrong-password') message = "Contraseña incorrecta";

      return { error: { ...error, message } };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setIsSuperAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isSuperAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
