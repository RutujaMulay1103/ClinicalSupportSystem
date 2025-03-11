'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatbotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme, patients } = useAppContext();
  
  // Get patient ID from URL
  const patientId = searchParams.get('patientId') ? parseInt(searchParams.get('patientId')!) : null;
  
  // States
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientName, setPatientName] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Find patient by ID or name
  useEffect(() => {
    if (patientId && patients.length > 0) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        setSelectedPatient(patient);
        setPatientName(patient.name);
      }
    }
  }, [patientId, patients]);
  
  // Handle patient search
  const handlePatientSearch = async () => {
    if (!patientName.trim()) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/patients?name=${patientName}`);
      
      if (response.data && response.data.length > 0) {
        setSelectedPatient(response.data[0]);
      } else {
        alert('No patient found with that name');
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
      
      // For demo purposes, search in local patients array if API is not available
      const patient = patients.find(p => p.name.toLowerCase().includes(patientName.toLowerCase()));
      if (patient) {
        setSelectedPatient(patient);
      } else {
        alert('No patient found with that name');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle query submission
  const handleQuerySubmit = async () => {
    if (!query.trim() || !selectedPatient) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: query,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      setLoading(true);
      
      // Send query to API
      const response = await axios.post('http://localhost:8000/api/query', {
        patientId: selectedPatient.id,
        query: query,
      });
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing query:', error);
      
      // For demo purposes, generate a mock response if API is not available
      const mockResponse = `Based on the clinical query about ${selectedPatient.name} (${selectedPatient.age}y, ${selectedPatient.gender}), I would recommend reviewing the patient's medical history of ${selectedPatient.medicalHistory.join(', ')}. Current medications include ${selectedPatient.medications.join(', ')}. Please consult the latest clinical guidelines for specific recommendations.\n\nDisclaimer: This is an AI-generated response for educational purposes. Always verify information with current medical literature and clinical judgment.`;
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: mockResponse,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="neo-header">
        <div className="neo-container flex justify-between items-center">
          <h1 className="text-2xl font-bold text-accent">Clinical Decision Support System</h1>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="neo-button">
              {theme === 'white-theme' ? 'Dark Mode' : 'Light Mode'}
            </button>
            <nav className="flex space-x-4">
              <Link href="/" className="neo-button">
                Home
              </Link>
              <Link href="/patients" className="neo-button">
                Patients
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-6 flex-grow flex">
        <div className="neo-container flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="neo-card h-full">
              <h2 className="text-xl font-bold text-accent mb-4">Patient Search</h2>
              
              <div className="flex mb-4">
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  className="neo-input flex-grow"
                />
                <button 
                  onClick={handlePatientSearch}
                  className="neo-button ml-2"
                  disabled={loading}
                >
                  Search
                </button>
              </div>
              
              {selectedPatient && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-2">Patient Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-semibold">Name:</span> {selectedPatient.name}</p>
                    <p><span className="font-semibold">Age:</span> {selectedPatient.age}</p>
                    <p><span className="font-semibold">Gender:</span> {selectedPatient.gender}</p>
                    <p><span className="font-semibold">Blood Group:</span> {selectedPatient.bloodGroup}</p>
                    <div>
                      <p className="font-semibold">Medical History:</p>
                      <ul className="list-disc pl-5">
                        {selectedPatient.medicalHistory.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Current Medications:</p>
                      <ul className="list-disc pl-5">
                        {selectedPatient.medications.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
            <div className="neo-card flex-grow mb-4 overflow-y-auto max-h-[60vh]">
              <h2 className="text-xl font-bold text-accent mb-4">Clinical Recommendations</h2>
              
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p>No messages yet. Start by selecting a patient and asking a clinical question.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-accent bg-opacity-20 ml-8' 
                          : 'neo-card mr-8'
                      }`}
                    >
                      <p className="font-semibold mb-1">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </p>
                      <div className="whitespace-pre-line">{message.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="neo-card">
              <h3 className="text-lg font-bold mb-2">Clinical Query</h3>
              <div className="flex flex-col space-y-3">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your clinical question here..."
                  className="neo-textarea"
                  disabled={!selectedPatient || loading}
                />
                <button 
                  onClick={handleQuerySubmit}
                  className="neo-button self-end"
                  disabled={!selectedPatient || !query.trim() || loading}
                >
                  {loading ? 'Processing...' : 'Submit Query'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="neo-footer">
        <div className="neo-container text-center">
          <p>&copy; {new Date().getFullYear()} Clinical Decision Support System</p>
        </div>
      </footer>
    </div>
  );
} 