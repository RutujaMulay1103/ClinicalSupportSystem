from fastapi import FastAPI, HTTPException, Query as FastAPIQuery
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import uvicorn
import datetime
from rag import RAGSystem

# Initialize FastAPI app
app = FastAPI(title="Clinical Decision Support System API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define data models
class Patient(BaseModel):
    id: Optional[int] = None
    name: str
    age: int
    gender: str
    bloodGroup: str
    medicalHistory: List[str]
    medications: List[str]

class QueryModel(BaseModel):
    patientId: int
    query: str

# Initialize RAG system
rag_system = RAGSystem()

# Data paths
PATIENTS_FILE = "../data/patients.json"
KNOWLEDGE_FILE = "../data/knowledge.json"
CHAT_HISTORY_FILE = "../data/chat_history.json"

# Helper functions
def load_patients():
    if not os.path.exists(PATIENTS_FILE):
        return []
    with open(PATIENTS_FILE, "r") as f:
        return json.load(f)

def save_patients(patients):
    with open(PATIENTS_FILE, "w") as f:
        json.dump(patients, f, indent=2)

def load_chat_history():
    """Load chat history from JSON file"""
    if not os.path.exists(CHAT_HISTORY_FILE):
        # Create an empty chat history file if it doesn't exist
        with open(CHAT_HISTORY_FILE, "w") as f:
            json.dump({}, f, indent=2)
        return {}
    
    with open(CHAT_HISTORY_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            # If the file is empty or invalid, return an empty dict
            return {}

def save_chat_history(chat_history):
    """Save chat history to JSON file"""
    with open(CHAT_HISTORY_FILE, "w") as f:
        json.dump(chat_history, f, indent=2)

def add_to_chat_history(patient_id, query, response):
    """Add a new entry to the chat history for a specific patient"""
    chat_history = load_chat_history()
    
    # Convert patient_id to string for JSON key
    patient_id_str = str(patient_id)
    
    # Create entry for patient if it doesn't exist
    if patient_id_str not in chat_history:
        chat_history[patient_id_str] = []
    
    # Create a new chat entry
    timestamp = datetime.datetime.now().isoformat()
    chat_entry = {
        "timestamp": timestamp,
        "query": query,
        "response": response
    }
    
    # Add to patient's history
    chat_history[patient_id_str].append(chat_entry)
    
    # Save updated history
    save_chat_history(chat_history)

# Routes
@app.get("/")
async def root():
    return {"message": "Clinical Decision Support System API"}

@app.get("/api/patients")
async def get_patients(name: Optional[str] = FastAPIQuery(None)):
    patients = load_patients()
    
    if name:
        filtered_patients = [p for p in patients if name.lower() in p["name"].lower()]
        if not filtered_patients:
            raise HTTPException(status_code=404, detail="No patients found with that name")
        return filtered_patients
    
    return patients

@app.get("/api/patients/{patient_id}")
async def get_patient(patient_id: int):
    patients = load_patients()
    for patient in patients:
        if patient["id"] == patient_id:
            return patient
    raise HTTPException(status_code=404, detail="Patient not found")

@app.post("/api/patients")
async def create_patient(patient: Patient):
    patients = load_patients()
    
    # Auto-increment ID
    max_id = 0
    for p in patients:
        if p["id"] > max_id:
            max_id = p["id"]
    
    new_patient = patient.dict()
    new_patient["id"] = max_id + 1
    
    patients.append(new_patient)
    save_patients(patients)
    
    return new_patient

@app.put("/api/patients/{patient_id}")
async def update_patient(patient_id: int, patient_update: Patient):
    patients = load_patients()
    
    # Find the patient to update
    patient_index = None
    for i, p in enumerate(patients):
        if p["id"] == patient_id:
            patient_index = i
            break
    
    if patient_index is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Update patient data while preserving the ID
    update_data = patient_update.dict(exclude_unset=True)
    update_data["id"] = patient_id  # Ensure ID remains the same
    
    # Update the patient in the list
    patients[patient_index] = update_data
    
    # Save updated patients list
    save_patients(patients)
    
    print(f"Updated patient {patient_id}: {update_data['name']}")
    
    return update_data

@app.post("/api/query")
async def process_query(query_data: QueryModel):
    # Get patient data
    patients = load_patients()
    patient = None
    
    for p in patients:
        if p["id"] == query_data.patientId:
            patient = p
            break
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    try:
        # Process query through RAG system
        print(f"Processing query: '{query_data.query}' for patient: {patient['name']} (ID: {patient['id']})")
        
        # Add additional debug information about the patient's conditions
        print(f"Patient medical history: {', '.join(patient['medicalHistory'])}")
        print(f"Patient medications: {', '.join(patient['medications'])}")
        
        # Generate response with patient-specific context
        response = rag_system.generate_response(query_data.query, patient)
        
        # Add to chat history
        add_to_chat_history(patient['id'], query_data.query, response)
        
        # Log successful query processing
        print(f"Successfully processed query for patient {patient['id']}")
        
        return {"response": response}
    except Exception as e:
        print(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

# Add a new endpoint to get chat history for a specific patient
@app.get("/api/patients/{patient_id}/history")
async def get_patient_chat_history(patient_id: int):
    # Load chat history
    chat_history = load_chat_history()
    
    # Convert patient_id to string for JSON key
    patient_id_str = str(patient_id)
    
    # Return patient's chat history or empty list if none exists
    return {"history": chat_history.get(patient_id_str, [])}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 