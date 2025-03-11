'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';

// Define interfaces
interface PatientFormData {
  name: string;
  age: string;
  gender: string;
  bloodGroup: string;
  medicalHistory: string;
  medications: string;
}

export default function PatientsPage() {
  const router = useRouter();
  const { theme, toggleTheme, patients, setPatients } = useAppContext();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: '',
    gender: '',
    bloodGroup: '',
    medicalHistory: '',
    medications: '',
  });
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/patients');
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        // For demo purposes, use mock data if API is not available
        const mockPatients = [
          {
            id: 1,
            name: "John Doe",
            age: 67,
            gender: "Male",
            bloodGroup: "A+",
            medicalHistory: ["Hypertension", "Type 2 Diabetes"],
            medications: ["Metformin", "Lisinopril"]
          },
          {
            id: 2,
            name: "Jane Smith",
            age: 52,
            gender: "Female",
            bloodGroup: "O-",
            medicalHistory: ["Asthma", "Osteoarthritis"],
            medications: ["Albuterol", "Acetaminophen"]
          },
          {
            id: 3,
            name: "Robert Johnson",
            age: 75,
            gender: "Male",
            bloodGroup: "B+",
            medicalHistory: ["Coronary Artery Disease", "COPD"],
            medications: ["Aspirin", "Atorvastatin", "Tiotropium"]
          }
        ];
        setPatients(mockPatients);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, [setPatients]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to patient object
    const newPatient = {
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      medicalHistory: formData.medicalHistory.split(',').map(item => item.trim()),
      medications: formData.medications.split(',').map(item => item.trim()),
    };
    
    try {
      // Send data to API
      const response = await axios.post('http://localhost:8000/api/patients', newPatient);
      
      // Update patients list
      setPatients([...patients, response.data]);
      
      // Close modal and reset form
      setIsModalOpen(false);
      setFormData({
        name: '',
        age: '',
        gender: '',
        bloodGroup: '',
        medicalHistory: '',
        medications: '',
      });
    } catch (error) {
      console.error('Error creating patient:', error);
      
      // For demo purposes, create a mock patient if API is not available
      const mockId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
      const mockPatient = {
        id: mockId,
        ...newPatient,
      };
      
      // Update patients list
      setPatients([...patients, mockPatient]);
      
      // Close modal and reset form
      setIsModalOpen(false);
      setFormData({
        name: '',
        age: '',
        gender: '',
        bloodGroup: '',
        medicalHistory: '',
        medications: '',
      });
    }
  };
  
  // Handle click on patient card
  const handlePatientClick = (patientId: number) => {
    router.push(`/chatbot?patientId=${patientId}`);
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
      <section className="py-8 flex-grow">
        <div className="neo-container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Patients</h2>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="neo-button"
            >
              Create New Patient
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Loading patients...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map((patient) => (
                <div 
                  key={patient.id} 
                  className="neo-card cursor-pointer hover:transform hover:translate-y-[-4px] transition-transform"
                  onClick={() => handlePatientClick(patient.id)}
                >
                  <h3 className="text-xl font-bold text-accent mb-2">{patient.name}</h3>
                  <p className="mb-1"><span className="font-semibold">Age:</span> {patient.age}</p>
                  <p className="mb-1"><span className="font-semibold">Gender:</span> {patient.gender}</p>
                  <p className="mb-1"><span className="font-semibold">Blood Group:</span> {patient.bloodGroup}</p>
                  <p className="mb-1">
                    <span className="font-semibold">Medical History:</span>{' '}
                    {patient.medicalHistory.join(', ')}
                  </p>
                  <p>
                    <span className="font-semibold">Current Medications:</span>{' '}
                    {patient.medications.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="neo-card w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-accent">Create New Patient</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="neo-input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="age" className="block mb-1">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  max="120"
                  className="neo-input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block mb-1">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="neo-dropdown"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="bloodGroup" className="block mb-1">Blood Group</label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="neo-dropdown"
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="medicalHistory" className="block mb-1">Medical History (comma-separated)</label>
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  className="neo-textarea"
                  placeholder="e.g. Hypertension, Diabetes, Asthma"
                />
              </div>
              
              <div>
                <label htmlFor="medications" className="block mb-1">Current Medications (comma-separated)</label>
                <textarea
                  id="medications"
                  name="medications"
                  value={formData.medications}
                  onChange={handleChange}
                  className="neo-textarea"
                  placeholder="e.g. Lisinopril, Metformin, Aspirin"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="neo-button bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="neo-button">
                  Create Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="neo-footer">
        <div className="neo-container text-center">
          <p>&copy; {new Date().getFullYear()} Clinical Decision Support System</p>
        </div>
      </footer>
    </div>
  );
} 