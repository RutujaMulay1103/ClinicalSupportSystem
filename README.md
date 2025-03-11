# AI-Powered Clinical Decision Support System

An AI-powered Clinical Decision Support System with a Neobrutalism design, built using React, FastAPI, and advanced RAG (Retrieval-Augmented Generation) technology to provide personalized clinical recommendations.

## Features

### Core Functionality
- **Home Page**: Introduction to the system with feature showcases
- **Sign In Page**: Registration form for hospital staff with hospital-specific fields
- **Patients Page**: View, create, and manage patient records
- **Chatbot Page**: AI-powered clinical recommendations based on patient data

### Advanced Features
- **Patient Data Management**:
  - Create new patient records with detailed medical information
  - Edit existing patient information including medical history and medications
  - View comprehensive patient details in a user-friendly interface

- **AI-Powered Clinical Recommendations**:
  - Personalized recommendations based on patient-specific data
  - Retrieval-Augmented Generation (RAG) pipeline for accurate and relevant responses
  - Integration of patient medical history and current medications in the recommendation process
  - Fallback mechanisms to ensure system reliability

- **Chat History Management**:
  - Persistent storage of all patient-specific conversations
  - Ability to view and restore previous conversations
  - Timestamp tracking for all interactions
  - Patient-specific chat history organization

## Tech Stack

### Frontend
- **React**: Core UI library with functional components and hooks
- **React Router**: For navigation between pages
- **Axios**: For API calls to the backend
- **CSS**: Custom Neobrutalism design system

### Backend
- **FastAPI**: High-performance Python web framework for API endpoints
- **Python 3.10+**: Core backend language
- **Pydantic**: For data validation and settings management

### AI and Machine Learning
- **Microsoft Phi-2**: Lightweight language model for generating clinical recommendations
- **Sentence Transformers**: For text embeddings and semantic search
- **RAG Pipeline**: Custom implementation combining retrieval and generation
- **Quantization**: 4-bit quantization for efficient model deployment
- **Accelerate & BitsAndBytes**: For optimized model loading and inference

### Data Storage
- **JSON-based Storage**: Lightweight, file-based data management
  - `patients.json`: Patient records and medical data
  - `knowledge.json`: Medical knowledge base with clinical guidelines
  - `chat_history.json`: Persistent storage of all patient conversations

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python 3.10+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/clinical-decision-support.git
cd clinical-decision-support
```

# For simple React frontend (compatible with Node.js v16+)
cd simple-frontend
npm install
```

3. Set up the backend
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Unix/MacOS:
source venv/bin/activate
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server
```bash
cd backend
python main.py
```

# For simple React frontend
cd simple-frontend
npm start
```

3. Open your browser and navigate to:
   - Next.js: `http://localhost:3000`
   - Simple React: `http://localhost:3000`

## Project Structure

```
clinical-decision-support/
├── frontend/                 # Next.js frontend (requires Node.js v18+)
│   └── src/
│       ├── app/              # Next.js app router
│       ├── context/          # React context providers
│       └── components/       # Reusable components
├── simple-frontend/          # Simple React frontend (compatible with Node.js v16+)
│   └── src/
│       ├── pages/            # Page components
│       └── components/       # Reusable components
├── backend/                  # FastAPI backend
│   ├── main.py               # Main API endpoints
│   ├── rag.py                # RAG implementation
│   └── requirements.txt      # Python dependencies
└── data/                     # JSON data storage
    ├── patients.json         # Patient data
    ├── knowledge.json        # Medical knowledge base
    └── chat_history.json     # Conversation history
```

## API Endpoints

### Patient Management
- `GET /api/patients`: Get all patients or search by name
- `GET /api/patients/{patient_id}`: Get a specific patient by ID
- `POST /api/patients`: Create a new patient
- `PUT /api/patients/{patient_id}`: Update an existing patient

### Clinical Recommendations
- `POST /api/query`: Process a clinical query and generate recommendations

### Chat History
- `GET /api/patients/{patient_id}/history`: Get chat history for a specific patient

## RAG Pipeline Architecture

The system uses a sophisticated Retrieval-Augmented Generation (RAG) pipeline:

1. **Retrieval Component**:
   - Uses Sentence Transformers to embed both the query and medical knowledge
   - Enhances queries with patient-specific information
   - Retrieves the most relevant medical knowledge using semantic search
   - Filters and ranks results based on relevance scores

2. **Context Building**:
   - Combines patient information with retrieved knowledge
   - Highlights patient conditions and medications relevant to the query
   - Structures context for optimal LLM processing

3. **Generation Component**:
   - Uses Microsoft's Phi-2 model for generating responses
   - Implements 4-bit quantization for efficiency
   - Provides specific instructions for patient-centered responses
   - Includes fallback mechanisms for reliability

4. **Response Processing**:
   - Extracts and formats the generated response
   - Adds appropriate disclaimers and references
   - Stores the interaction in the patient's chat history

## Design

The application follows a Neobrutalism design with:
- Monotonous color palette with primary accent color rgba(59, 130, 246, .5)
- Smooth edges with border-radius: 8px-12px
- Shadow effects with box-shadow: 4px 4px 0px rgba(0,0,0,0.1)
- White and dark themes
- Responsive layout for various screen sizes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Microsoft for the Phi-2 language model
- Sentence Transformers for providing the embedding models
- FastAPI and React for the excellent frameworks 
