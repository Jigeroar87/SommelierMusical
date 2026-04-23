import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db, testConnection, handleFirestoreError } from '../lib/firebase';
import { QuadrantType } from '../data/songs';
import { User as AppUser } from '../types';

interface TestAnswer {
  song_id: string;
  score: number;
  cuadrante_principal: QuadrantType;
}

interface TestContextType {
  currentTestAnswers: TestAnswer[];
  addAnswer: (songId: string, score: number, cuadrante_principal: QuadrantType) => void;
  resetTest: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: AppUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (displayName: string, birthDate: string) => Promise<void>;
  getDominantQuadrant: () => QuadrantType | null;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTestAnswers, setCurrentTestAnswers] = useState<TestAnswer[]>(() => {
    const saved = localStorage.getItem('currentTestAnswers');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: fbUser.uid,
              email: fbUser.email || '',
              displayName: userData.display_name || fbUser.displayName || '',
              photoURL: fbUser.photoURL || undefined,
              is_admin: userData.is_admin || false,
              createdAt: userData.created_at?.toDate()?.toISOString() || new Date().toISOString(),
              biography_status: userData.biography_status || 'pending',
              birthDate: userData.birth_date,
              onboardingCompleted: userData.onboarding_completed || false
            });
            setIsAdmin(userData.is_admin || false);
          } else {
            // New user registration
            const newUser: any = {
              uid: fbUser.uid,
              email: fbUser.email,
              display_name: fbUser.displayName,
              photo_url: fbUser.photoURL,
              is_admin: false,
              biography_status: 'pending',
              onboarding_completed: false,
              created_at: serverTimestamp(),
              updated_at: serverTimestamp()
            };
            await setDoc(doc(db, 'users', fbUser.uid), newUser);
            
            setUser({
              id: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || '',
              photoURL: fbUser.photoURL || undefined,
              is_admin: false,
              createdAt: new Date().toISOString(),
              biography_status: 'pending',
              onboardingCompleted: false
            });
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentTestAnswers.length > 0) {
      localStorage.setItem('currentTestAnswers', JSON.stringify(currentTestAnswers));
    }
  }, [currentTestAnswers]);

  const addAnswer = (song_id: string, score: number, cuadrante_principal: QuadrantType) => {
    setCurrentTestAnswers(prev => {
      const filtered = prev.filter(a => a.song_id !== song_id);
      return [...filtered, { song_id, score, cuadrante_principal }];
    });
  };

  const completeOnboarding = async (displayName: string, birthDate: string) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        display_name: displayName,
        birth_date: birthDate,
        biography_status: 'completed',
        onboarding_completed: true,
        updated_at: serverTimestamp()
      }, { merge: true });

      setUser(prev => prev ? {
        ...prev,
        displayName,
        birthDate,
        biography_status: 'completed',
        onboardingCompleted: true
      } : null);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
    }
  };

  const getDominantQuadrant = (): QuadrantType | null => {
    if (currentTestAnswers.length === 0) return null;

    const scores: Record<QuadrantType, number> = {
      abraza: 0,
      prende: 0,
      eleva: 0,
      revela: 0
    };

    currentTestAnswers.forEach(ans => {
      scores[ans.cuadrante_principal] += ans.score;
    });

    return Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))[0] as QuadrantType;
  };

  const resetTest = () => {
    setCurrentTestAnswers([]);
    localStorage.removeItem('currentTestAnswers');
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      resetTest();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return (
    <TestContext.Provider value={{ 
      currentTestAnswers, 
      addAnswer, 
      resetTest, 
      isLoggedIn: !!user, 
      isAdmin,
      user,
      loading,
      login, 
      logout,
      completeOnboarding,
      getDominantQuadrant
    }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};
