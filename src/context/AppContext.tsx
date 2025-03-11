'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the patient type
export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  medicalHistory: string[];
  medications: string[];
}

// Define the app context type
interface AppContextType {
  theme: 'white-theme' | 'dark-theme';
  toggleTheme: () => void;
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider props
interface AppProviderProps {
  children: ReactNode;
}

// Provider component
export function AppProvider({ children }: AppProviderProps) {
  // Theme state
  const [theme, setTheme] = useState<'white-theme' | 'dark-theme'>('white-theme');
  
  // Patients state
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Selected patient state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === 'white-theme' ? 'dark-theme' : 'white-theme');
  };

  // Apply theme to body element
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Context value
  const value = {
    theme,
    toggleTheme,
    patients,
    setPatients,
    selectedPatient,
    setSelectedPatient,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the app context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 