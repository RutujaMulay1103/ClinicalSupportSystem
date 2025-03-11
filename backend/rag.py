import json
import os
from typing import Dict, List, Any
from sentence_transformers import SentenceTransformer, util
import torch
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

class RAGSystem:
    def __init__(self):
        # Initialize the embedding model for retrieval
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Load knowledge base from JSON file
        self.knowledge_base = self.load_knowledge()
        
        # Create embeddings for the knowledge base
        self.knowledge_texts = [item["text"] for item in self.knowledge_base]
        self.knowledge_embeddings = self.embed_texts(self.knowledge_texts)
        
        # Initialize the LLM for generation
        self.initialize_llm()
        
    def initialize_llm(self):
        """Initialize the language model for generation"""
        try:
            print("Loading language model...")
            # Use a smaller model that can run on CPU or limited GPU memory
            model_name = "microsoft/phi-2"
            
            # Quantization config for memory efficiency
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.float16
            )
            
            # First try to load with quantization for GPU
            try:
                model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    device_map="auto",
                    quantization_config=quantization_config,
                )
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.llm = pipeline(
                    "text-generation",
                    model=model,
                    tokenizer=tokenizer
                )
                print("Language model loaded with GPU acceleration")
            except Exception as e:
                print(f"GPU loading failed, falling back to CPU: {e}")
                # If GPU loading fails, fall back to CPU with smaller model
                model = AutoModelForCausalLM.from_pretrained(
                    "microsoft/phi-2", 
                    trust_remote_code=True,
                    torch_dtype=torch.float32,  # Use float32 for CPU
                )
                tokenizer = AutoTokenizer.from_pretrained("microsoft/phi-2")
                self.llm = pipeline(
                    "text-generation",
                    model=model,
                    tokenizer=tokenizer
                )
                print("Language model loaded on CPU")
        except Exception as e:
            print(f"Error loading language model: {e}")
            print("Using fallback mock response generation")
            self.llm = None
    
    def load_knowledge(self):
        knowledge_file = "../data/knowledge.json"
        if not os.path.exists(knowledge_file):
            return []
        
        with open(knowledge_file, "r") as f:
            return json.load(f)
    
    def embed_texts(self, texts: List[str]):
        return self.embedding_model.encode(texts, convert_to_tensor=True)
    
    def retrieve_relevant_knowledge(self, query: str, patient: Dict[str, Any], top_k=3):
        """Retrieve relevant knowledge based on query and patient data"""
        # Create an enhanced query that includes patient-specific information
        patient_info = f"{query} for a {patient['age']} year old {patient['gender']} with medical history of {', '.join(patient['medicalHistory'])} taking {', '.join(patient['medications'])}"
        
        # Embed the enhanced query
        query_embedding = self.embed_texts([patient_info])
        
        # Calculate cosine similarities between query and knowledge base
        cos_scores = util.cos_sim(query_embedding, self.knowledge_embeddings)[0]
        
        # Get top-k most similar knowledge items
        top_results = torch.topk(cos_scores, k=min(top_k, len(cos_scores)))
        
        retrieved_knowledge = []
        for score, idx in zip(top_results[0], top_results[1]):
            retrieved_knowledge.append({
                "text": self.knowledge_texts[idx],
                "source": self.knowledge_base[idx]["source"],
                "score": score.item()
            })
        
        # Filter for relevance - ensure at least one knowledge item is related to the query or patient condition
        if query.lower() not in ' '.join([k['text'].lower() for k in retrieved_knowledge]):
            # Try to find additional knowledge related specifically to the query
            query_specific = self.embed_texts([query])
            query_scores = util.cos_sim(query_specific, self.knowledge_embeddings)[0]
            query_results = torch.topk(query_scores, k=min(2, len(query_scores)))
            
            for score, idx in zip(query_results[0], query_results[1]):
                # Only add if it's not already in the list
                if not any(k['text'] == self.knowledge_texts[idx] for k in retrieved_knowledge):
                    retrieved_knowledge.append({
                        "text": self.knowledge_texts[idx],
                        "source": self.knowledge_base[idx]["source"],
                        "score": score.item()
                    })
        
        return retrieved_knowledge
    
    def generate_response(self, query: str, patient: Dict[str, Any]) -> str:
        # Retrieve relevant medical knowledge based on both query and patient data
        relevant_knowledge = self.retrieve_relevant_knowledge(query, patient)
        
        # Format the context for the response
        context = self._build_context(query, patient, relevant_knowledge)
        
        # Generate response using LLM or fallback to mock response
        if self.llm is not None:
            try:
                response = self._generate_llm_response(context, query, patient)
                return response
            except Exception as e:
                print(f"Error generating LLM response: {e}")
                print("Falling back to mock response")
                return self._generate_mock_response(query, patient, relevant_knowledge)
        else:
            return self._generate_mock_response(query, patient, relevant_knowledge)
    
    def _build_context(self, query: str, patient: Dict[str, Any], relevant_knowledge: List[Dict[str, Any]]) -> str:
        """Build the context for the LLM prompt with detailed patient information"""
        # Patient information section with detailed format
        context = f"""Patient Information:
- Name: {patient['name']}
- Age: {patient['age']} years
- Gender: {patient['gender']}
- Blood Group: {patient['bloodGroup']}
- Medical History: {', '.join(patient['medicalHistory'])}
- Current Medications: {', '.join(patient['medications'])}

Current Query: "{query}"

"""
        
        # Check if any medical history items are related to the query
        query_lower = query.lower()
        related_conditions = [condition for condition in patient['medicalHistory'] 
                             if query_lower in condition.lower() or any(word in condition.lower() 
                                                                       for word in query_lower.split())]
        
        if related_conditions:
            context += f"Note: Patient has relevant medical history of: {', '.join(related_conditions)}\n\n"
        
        # Check if any medications might be related to the query
        related_meds = [med for med in patient['medications'] 
                        if any(word in med.lower() for word in query_lower.split())]
        
        if related_meds:
            context += f"Note: Patient is taking medications that may be relevant: {', '.join(related_meds)}\n\n"
        
        # Add relevant medical knowledge with scores to help prioritize
        context += "Relevant Medical Knowledge (in order of relevance):\n"
        
        # Sort knowledge by relevance score
        sorted_knowledge = sorted(relevant_knowledge, key=lambda x: x['score'], reverse=True)
        
        for i, knowledge in enumerate(sorted_knowledge, 1):
            relevance = int(knowledge['score'] * 100)
            context += f"{i}. {knowledge['text']} (Relevance: {relevance}%, Source: {knowledge['source']})\n"
        
        return context
    
    def _generate_llm_response(self, context: str, query: str, patient: Dict[str, Any]) -> str:
        """Generate a response using the language model with patient-specific guidance"""
        
        # Construct the prompt with specific instructions for patient-centered response
        prompt = f"""You are an AI clinical decision support system designed to help healthcare professionals.
Based on the following patient information and medical knowledge, provide a concise and evidence-based response to the clinical query.

{context}

Clinical Query: {query}

Instructions:
1. Directly address the query "{query}" in relation to this specific patient ({patient['name']}, {patient['age']}y, {patient['gender']}).
2. Consider the patient's specific medical history, medications, and other factors that may influence your recommendations.
3. Highlight any potential interactions between the query and the patient's existing conditions or medications.
4. Reference the medical knowledge provided and explain its relevance to this specific patient.
5. Structure your response with clear, actionable recommendations where appropriate.
6. Avoid generic responses that could apply to any patient.

Response:"""
        
        # Generate response
        generation_config = {
            "max_new_tokens": 512,
            "temperature": 0.3,
            "top_p": 0.9,
            "do_sample": True,
            "num_return_sequences": 1,
        }
        
        generated_texts = self.llm(
            prompt,
            **generation_config
        )
        
        # Extract generated text
        response_text = generated_texts[0]["generated_text"]
        
        # Extract only the part after "Response:"
        if "Response:" in response_text:
            response_text = response_text.split("Response:")[1].strip()
        
        # Add disclaimer
        response_text += "\n\nDisclaimer: This is an AI-generated response for educational purposes. "
        response_text += "Always verify information with current medical literature and clinical judgment."
        
        return response_text
    
    def _generate_mock_response(self, query: str, patient: Dict[str, Any], 
                               relevant_knowledge: List[Dict[str, Any]]) -> str:
        """Generate a mock response based on the retrieved knowledge and patient data."""
        
        # This is a simplified approach; in production, this would be replaced by an actual LLM
        
        # Basic response structure
        response = f"Based on the clinical query about {patient['name']} ({patient['age']}y, {patient['gender']})"
        
        # Check if the query contains certain keywords and match to knowledge
        query_lower = query.lower()
        
        if any(condition.lower() in query_lower for condition in patient['medicalHistory']):
            # Query is about the patient's existing conditions
            condition = next((c for c in patient['medicalHistory'] if c.lower() in query_lower), None)
            if condition:
                relevant_info = next((k for k in relevant_knowledge 
                                     if condition.lower() in k['text'].lower()), None)
                if relevant_info:
                    response += f", regarding their {condition}:\n\n{relevant_info['text']}\n\n"
                    response += f"Reference: {relevant_info['source']}"
                else:
                    response += f", regarding their {condition}:\n\n"
                    response += "I don't have specific guidelines for this condition in my knowledge base. "
                    response += "Consider consulting the latest clinical guidelines."
        
        elif "medication" in query_lower or "drug" in query_lower:
            # Query is about medications
            response += ", regarding medications:\n\n"
            
            if patient['medications']:
                response += f"The patient is currently taking: {', '.join(patient['medications'])}.\n\n"
                
                med_info = next((k for k in relevant_knowledge 
                                if any(med.lower() in k['text'].lower() 
                                      for med in patient['medications'])), None)
                
                if med_info:
                    response += f"Relevant information: {med_info['text']}\n\n"
                    response += f"Reference: {med_info['source']}"
                else:
                    response += "Please review the latest medication guidelines for specific dosing and interactions."
            else:
                response += "The patient is not currently taking any medications."
        
        elif "recommendation" in query_lower or "treatment" in query_lower:
            # Query is about treatment recommendations
            response += ", here are clinical recommendations:\n\n"
            
            if relevant_knowledge:
                most_relevant = relevant_knowledge[0]
                response += f"{most_relevant['text']}\n\n"
                response += f"Reference: {most_relevant['source']}"
            else:
                response += "I don't have specific recommendations for this query in my knowledge base. "
                response += "Consider consulting the latest clinical guidelines."
        
        else:
            # Generic response for other types of queries
            if relevant_knowledge:
                response += ":\n\n"
                for i, knowledge in enumerate(relevant_knowledge[:2], 1):
                    response += f"{i}. {knowledge['text']}\n"
                    response += f"   Reference: {knowledge['source']}\n\n"
            else:
                response += ":\n\nI don't have enough information to provide a specific response to this query. "
                response += "Consider consulting the latest clinical guidelines or providing more details."
        
        # Add disclaimer
        response += "\n\nDisclaimer: This is an AI-generated response for educational purposes. "
        response += "Always verify information with current medical literature and clinical judgment."
        
        return response 