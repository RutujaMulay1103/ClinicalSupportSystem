import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Chatbot() {
  const [searchParams] = useSearchParams();
  
  // Get patient ID from URL
  const patientId = searchParams.get('patientId') ? parseInt(searchParams.get('patientId')) : null;
  
  // States
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    age: '',
    gender: '',
    bloodGroup: '',
    medicalHistory: '',
    medications: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Find patient by ID or name
  useEffect(() => {
    if (patientId) {
      fetchPatientById(patientId);
    }
  }, [patientId]);
  
  // Initialize edit data when patient changes
  useEffect(() => {
    if (selectedPatient) {
      setEditData({
        name: selectedPatient.name,
        age: selectedPatient.age.toString(),
        gender: selectedPatient.gender,
        bloodGroup: selectedPatient.bloodGroup,
        medicalHistory: selectedPatient.medicalHistory.join(', '),
        medications: selectedPatient.medications.join(', ')
      });
    }
  }, [selectedPatient]);
  
  const fetchPatientById = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/patients/${id}`);
      setSelectedPatient(response.data);
      setPatientName(response.data.name);
    } catch (error) {
      console.error('Error fetching patient:', error);
      
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
      
      const mockPatient = mockPatients.find(p => p.id === id);
      if (mockPatient) {
        setSelectedPatient(mockPatient);
        setPatientName(mockPatient.name);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };
  
  // Save patient updates
  const handleSaveEdit = async () => {
    if (!selectedPatient) return;
    
    try {
      setUpdateLoading(true);
      
      // Convert comma-separated strings to arrays
      const updatedPatient = {
        name: editData.name,
        age: parseInt(editData.age),
        gender: editData.gender,
        bloodGroup: editData.bloodGroup,
        medicalHistory: editData.medicalHistory.split(',').map(item => item.trim()).filter(item => item),
        medications: editData.medications.split(',').map(item => item.trim()).filter(item => item)
      };
      
      // Send update to API
      const response = await axios.put(
        `http://localhost:8000/api/patients/${selectedPatient.id}`, 
        updatedPatient
      );
      
      // Update local state with the response
      setSelectedPatient(response.data);
      setPatientName(response.data.name);
      
      // Exit edit mode
      setEditMode(false);
      
      // Show success message
      alert('Patient information updated successfully');
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Failed to update patient information. Please try again.');
      
      // For demo purposes, update the local state anyway
      const updatedPatient = {
        ...selectedPatient,
        name: editData.name,
        age: parseInt(editData.age),
        gender: editData.gender,
        bloodGroup: editData.bloodGroup,
        medicalHistory: editData.medicalHistory.split(',').map(item => item.trim()).filter(item => item),
        medications: editData.medications.split(',').map(item => item.trim()).filter(item => item)
      };
      
      setSelectedPatient(updatedPatient);
      setPatientName(updatedPatient.name);
      setEditMode(false);
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Fetch chat history for the selected patient
  const fetchChatHistory = async () => {
    if (!selectedPatient) return;
    
    try {
      setLoadingHistory(true);
      const response = await axios.get(`http://localhost:8000/api/patients/${selectedPatient.id}/history`);
      setChatHistory(response.data.history || []);
      setShowChatHistory(true);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      // If API call fails, show empty history
      setChatHistory([]);
      setShowChatHistory(true);
    } finally {
      setLoadingHistory(false);
    }
  };
  
  // Toggle chat history display
  const toggleChatHistory = () => {
    if (!showChatHistory && !chatHistory.length) {
      fetchChatHistory();
    } else {
      setShowChatHistory(!showChatHistory);
    }
  };
  
  // Format timestamp for display
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch (error) {
      return isoString;
    }
  };
  
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
      
      const mockPatient = mockPatients.find(p => 
        p.name.toLowerCase().includes(patientName.toLowerCase())
      );
      
      if (mockPatient) {
        setSelectedPatient(mockPatient);
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
    const userMessage = {
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
      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing query:', error);
      
      // For demo purposes, generate a mock response if API is not available
      const mockResponse = `Based on the clinical query about ${selectedPatient.name} (${selectedPatient.age}y, ${selectedPatient.gender}), I would recommend reviewing the patient's medical history of ${selectedPatient.medicalHistory.join(', ')}. Current medications include ${selectedPatient.medications.join(', ')}. Please consult the latest clinical guidelines for specific recommendations.\n\nDisclaimer: This is an AI-generated response for educational purposes. Always verify information with current medical literature and clinical judgment.`;
      
      const assistantMessage = {
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
      <Header />

      {/* Main Content */}
      <section className="py-6 flex-grow flex">
        <div className="neo-container">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-1/3">
              <div className="neo-card">
                <h2 className="text-xl font-bold text-accent mb-4">Patient Search</h2>
                
                <div className="flex mb-4">
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name"
                    className="neo-input"
                    style={{ flexGrow: 1 }}
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
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold">Patient Details</h3>
                      <div className="flex space-x-2">
                        {!showChatHistory && !editMode && (
                          <button 
                            onClick={() => setEditMode(true)} 
                            className="neo-button text-sm"
                          >
                            Edit
                          </button>
                        )}
                        <button 
                          onClick={toggleChatHistory} 
                          className="neo-button text-sm"
                          disabled={editMode}
                        >
                          {showChatHistory ? 'Hide History' : 'Chat History'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Patient details section - View Mode */}
                    {!showChatHistory && !editMode && (
                      <div className="space-y-2">
                        <p><span className="font-bold">Name:</span> {selectedPatient.name}</p>
                        <p><span className="font-bold">Age:</span> {selectedPatient.age}</p>
                        <p><span className="font-bold">Gender:</span> {selectedPatient.gender}</p>
                        <p><span className="font-bold">Blood Group:</span> {selectedPatient.bloodGroup}</p>
                        <div>
                          <p className="font-bold">Medical History:</p>
                          <ul className="list-disc pl-5">
                            {selectedPatient.medicalHistory.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-bold">Current Medications:</p>
                          <ul className="list-disc pl-5">
                            {selectedPatient.medications.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {/* Patient details section - Edit Mode */}
                    {!showChatHistory && editMode && (
                      <div className="space-y-3">
                        <div>
                          <label className="block mb-1 font-bold">Name:</label>
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleEditChange}
                            className="neo-input"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-bold">Age:</label>
                          <input
                            type="number"
                            name="age"
                            value={editData.age}
                            onChange={handleEditChange}
                            className="neo-input"
                            min="0"
                            max="120"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-bold">Gender:</label>
                          <select
                            name="gender"
                            value={editData.gender}
                            onChange={handleEditChange}
                            className="neo-dropdown"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block mb-1 font-bold">Blood Group:</label>
                          <select
                            name="bloodGroup"
                            value={editData.bloodGroup}
                            onChange={handleEditChange}
                            className="neo-dropdown"
                          >
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
                          <label className="block mb-1 font-bold">Medical History (comma-separated):</label>
                          <textarea
                            name="medicalHistory"
                            value={editData.medicalHistory}
                            onChange={handleEditChange}
                            className="neo-textarea"
                            placeholder="e.g. Hypertension, Diabetes, Asthma"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-bold">Current Medications (comma-separated):</label>
                          <textarea
                            name="medications"
                            value={editData.medications}
                            onChange={handleEditChange}
                            className="neo-textarea"
                            placeholder="e.g. Lisinopril, Metformin, Aspirin"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <button
                            type="button"
                            onClick={() => setEditMode(false)}
                            className="neo-button"
                            style={{ backgroundColor: '#ccc' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="neo-button"
                            disabled={updateLoading}
                          >
                            {updateLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Chat History section */}
                    {showChatHistory && (
                      <div className="mt-2 max-h-[400px] overflow-y-auto">
                        <h4 className="font-bold mb-2">Previous Conversations</h4>
                        
                        {loadingHistory ? (
                          <p>Loading chat history...</p>
                        ) : chatHistory.length === 0 ? (
                          <p className="text-sm italic">No previous conversations found</p>
                        ) : (
                          <div className="space-y-4">
                            {chatHistory.map((entry, index) => (
                              <div key={index} className="border-b pb-2">
                                <p className="text-xs text-gray-500">{formatDate(entry.timestamp)}</p>
                                <p className="font-bold mt-1">Query: {entry.query}</p>
                                <p className="text-sm mt-1 line-clamp-2">
                                  {entry.response.substring(0, 100)}
                                  {entry.response.length > 100 ? '...' : ''}
                                </p>
                                <button 
                                  className="text-accent text-xs underline mt-1"
                                  onClick={() => {
                                    setMessages([
                                      { role: 'user', content: entry.query },
                                      { role: 'assistant', content: entry.response }
                                    ]);
                                    setShowChatHistory(false);
                                  }}
                                >
                                  View Full Conversation
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat Area */}
            <div className="w-full md:w-2/3 flex flex-col">
              <div className="neo-card flex-grow mb-4" style={{ minHeight: '300px', maxHeight: '60vh', overflow: 'auto' }}>
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
                        <p className="font-bold mb-1">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </p>
                        <div style={{ whiteSpace: 'pre-line' }}>{message.content}</div>
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
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Chatbot; 