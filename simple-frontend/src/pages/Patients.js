import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Patients() {
  const navigate = useNavigate();
  
  // State
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    bloodGroup: '',
    medicalHistory: '',
    medications: '',
  });
  
  // Ref for modal animation
  const modalRef = useRef(null);
  
  // Handle modal close with animation
  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
      // Reset form data when modal is fully closed
      setFormData({
        name: '',
        age: '',
        gender: '',
        bloodGroup: '',
        medicalHistory: '',
        medications: '',
      });
    }, 300); // Match this with the animation duration
  };
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);
  
  // Close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };
  
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
  }, []);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
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
      
      // Close modal with animation
      closeModal();
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
      
      // Close modal with animation
      closeModal();
    }
  };
  
  // Handle click on patient card
  const handlePatientClick = (patientId) => {
    navigate(`/chatbot?patientId=${patientId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

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
                  className="neo-card cursor-pointer"
                  onClick={() => handlePatientClick(patient.id)}
                >
                  <h3 className="text-xl font-bold text-accent mb-2">{patient.name}</h3>
                  <p className="mb-1"><span className="font-bold">Age:</span> {patient.age}</p>
                  <p className="mb-1"><span className="font-bold">Gender:</span> {patient.gender}</p>
                  <p className="mb-1"><span className="font-bold">Blood Group:</span> {patient.bloodGroup}</p>
                  <p className="mb-1">
                    <span className="font-bold">Medical History:</span>{' '}
                    {patient.medicalHistory.join(', ')}
                  </p>
                  <p>
                    <span className="font-bold">Current Medications:</span>{' '}
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
        <div 
          className="modal-overlay" 
          onClick={handleOverlayClick}
          style={{ 
            animation: isModalClosing ? 'modalFadeOut 0.3s ease-out forwards' : 'none'
          }}
        >
          <div 
            ref={modalRef}
            className="modal-content"
            style={{ 
              animation: isModalClosing ? 'modalFadeOut 0.3s ease-out forwards' : 'modalFadeIn 0.3s ease-out'
            }}
          >
            <div className="modal-header">
              <h2 className="text-2xl font-bold text-accent">Create New Patient</h2>
              <button 
                onClick={closeModal}
                className="modal-close"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-1 font-bold">Name</label>
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
                  <label htmlFor="age" className="block mb-1 font-bold">Age</label>
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
                  <label htmlFor="gender" className="block mb-1 font-bold">Gender</label>
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
                  <label htmlFor="bloodGroup" className="block mb-1 font-bold">Blood Group</label>
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
                  <label htmlFor="medicalHistory" className="block mb-1 font-bold">Medical History (comma-separated)</label>
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
                  <label htmlFor="medications" className="block mb-1 font-bold">Current Medications (comma-separated)</label>
                  <textarea
                    id="medications"
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    className="neo-textarea"
                    placeholder="e.g. Lisinopril, Metformin, Aspirin"
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-2">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="neo-button"
                    style={{ backgroundColor: '#ccc' }}
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
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Patients; 