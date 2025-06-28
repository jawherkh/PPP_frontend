#!/usr/bin/env python3
"""
Simple test backend for circuit analysis frontend
Run with: python test-backend.py
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uuid
import os
import json
from datetime import datetime

app = FastAPI(title="Circuit Analysis Test Backend", version="1.0.0")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories for file storage
os.makedirs("files", exist_ok=True)
os.makedirs("sessions", exist_ok=True)

# Mount static files
app.mount("/files", StaticFiles(directory="files"), name="files")

# Data models
class QueryRequest(BaseModel):
    query: str
    endpoint: str = "auto"

class SimpleQueryRequest(BaseModel):
    query: str

# Mock data for testing
SAMPLE_RESPONSES = {
    "simple": [
        "A resistor is a passive electronic component that limits current flow.",
        "Ohm's law states that V = I × R, where V is voltage, I is current, and R is resistance.",
        "Capacitors store electrical energy in an electric field between two conductive plates.",
        "An inductor is a passive component that stores energy in a magnetic field.",
    ],
    "complex": [
        "I'll analyze this circuit for you. Let me generate the schematic and run simulations.",
        "This requires a detailed circuit analysis. I'll create the circuit diagram and calculate the frequency response.",
        "I'll design this circuit and provide a comprehensive analysis with plots and calculations.",
    ]
}

SAMPLE_REPORTS = {
    "rc_circuit": """# RC Low-Pass Filter Analysis

## Circuit Overview
This analysis covers a simple RC low-pass filter circuit with the following components:
- Resistor R1: 1kΩ
- Capacitor C1: 100µF

## Transfer Function
The transfer function of this RC circuit is:

$$H(s) = \\frac{1}{1 + sRC}$$

## Key Parameters
| Parameter | Value | Unit |
|-----------|-------|------|
| Cutoff Frequency | 1.59 | kHz |
| DC Gain | 0 | dB |
| Phase Margin | 90 | degrees |

## Frequency Response
The circuit exhibits typical low-pass filter behavior:
- **Pass Band**: Frequencies below 1.59 kHz pass with minimal attenuation
- **Stop Band**: Frequencies above cutoff are attenuated at -20dB/decade
- **3dB Point**: At 1.59 kHz, the output is 3dB below the input

## Time Domain Response
For a step input, the output follows:
$$v_{out}(t) = V_{in}(1 - e^{-t/RC})u(t)$$

## Recommendations
1. Use precision components for critical applications
2. Consider temperature compensation for improved stability
3. Add buffer amplifiers to prevent loading effects
""",
    "amplifier": """# BJT Amplifier Circuit Analysis

## Circuit Configuration
Common emitter amplifier with the following specifications:
- Transistor: 2N2222 NPN BJT
- Collector Resistor: 2.2kΩ
- Base Bias Resistors: 47kΩ, 10kΩ
- Emitter Resistor: 1kΩ

## DC Operating Point
| Parameter | Value | Unit |
|-----------|-------|------|
| Collector Current | 2.3 | mA |
| Base Current | 23 | µA |
| VCE | 4.9 | V |
| Beta (hFE) | 100 | - |

## AC Analysis
- **Voltage Gain**: -47 dB
- **Input Impedance**: 2.1 kΩ
- **Output Impedance**: 2.2 kΩ
- **Bandwidth**: 10 Hz to 100 kHz

## Performance Characteristics
The amplifier provides good voltage gain with moderate input impedance. The frequency response shows:
- Flat gain in the mid-band region
- High-frequency rolloff due to transistor capacitances
- Low-frequency rolloff due to coupling capacitors
"""
}

def create_sample_report(query: str) -> str:
    """Generate a sample report based on the query content"""
    query_lower = query.lower()
    
    if any(word in query_lower for word in ["rc", "resistor", "capacitor", "filter"]):
        return SAMPLE_REPORTS["rc_circuit"]
    elif any(word in query_lower for word in ["amplifier", "transistor", "bjt", "gain"]):
        return SAMPLE_REPORTS["amplifier"]
    else:
        return SAMPLE_REPORTS["rc_circuit"]  # Default

def classify_query_complexity(query: str) -> tuple[str, float, str]:
    """Classify if a query is simple or complex"""
    query_lower = query.lower()
    
    # Complex indicators
    complex_keywords = [
        "analyze", "design", "simulate", "calculate", "frequency response",
        "transfer function", "bode plot", "circuit diagram", "schematic",
        "amplifier", "filter", "oscillator", "power supply"
    ]
    
    # Simple indicators
    simple_keywords = [
        "what is", "define", "explain", "how does", "basic", "simple"
    ]
    
    complex_score = sum(1 for keyword in complex_keywords if keyword in query_lower)
    simple_score = sum(1 for keyword in simple_keywords if keyword in query_lower)
    word_count = len(query.split())
    
    # Decision logic
    if complex_score > 0 or word_count > 15:
        return "complex", 0.8 + min(complex_score * 0.1, 0.2), f"Contains {complex_score} complex keywords"
    elif simple_score > 0 or word_count < 8:
        return "simple", 0.7 + min(simple_score * 0.1, 0.3), f"Contains {simple_score} simple keywords"
    else:
        return "simple", 0.6, "Default classification based on length"

@app.get("/")
async def root():
    return {
        "message": "Circuit Analysis Test Backend",
        "status": "running",
        "endpoints": ["/process-query", "/simple-query", "/classify-query"]
    }

@app.post("/process-query")
async def process_query(request: QueryRequest):
    """Main endpoint for processing circuit analysis queries"""
    session_id = str(uuid.uuid4())
    query = request.query
    endpoint = request.endpoint
    
    # Classify the query
    classification, confidence, reasoning = classify_query_complexity(query)
    
    # Route based on endpoint parameter
    if endpoint == "simple" or (endpoint == "auto" and classification == "simple"):
        # Simple response
        import random
        response_text = random.choice(SAMPLE_RESPONSES["simple"])
        return {
            "session_id": session_id,
            "status": "success",
            "message": response_text,
            "query": query
        }
    
    elif endpoint == "classify":
        # Classification only
        return {
            "session_id": session_id,
            "status": "success",
            "message": f"**Query Classification:**\n\n**Type:** {classification}\n**Confidence:** {int(confidence * 100)}%\n**Reasoning:** {reasoning}",
            "query": query
        }
    
    else:
        # Full analysis (complex response)
        import random
        response_text = random.choice(SAMPLE_RESPONSES["complex"])
        
        # Create sample files (in a real system, you'd generate actual circuit diagrams)
        files_dict = {}
        
        # For demonstration, we'll create text files with URLs
        # In a real system, you'd generate actual images and reports
        base_url = "http://localhost:8000/files"
        
        # Simulate file generation
        if "circuit" in query.lower() or "schematic" in query.lower():
            files_dict["schema_diagram"] = f"{base_url}/{session_id}/circuit_diagram.png"
        
        if "plot" in query.lower() or "frequency" in query.lower() or "analyze" in query.lower():
            files_dict["circuit_plot"] = f"{base_url}/{session_id}/frequency_plot.png"
        
        # Always include analysis report for complex queries
        report_content = create_sample_report(query)
        
        # Save report to file
        session_dir = f"files/{session_id}"
        os.makedirs(session_dir, exist_ok=True)
        
        with open(f"{session_dir}/analysis_report.txt", "w") as f:
            f.write(report_content)
        
        files_dict["analysis_report"] = f"{base_url}/{session_id}/analysis_report.txt"
        
        # Create a summary
        summary = f"Analysis complete for: {query}\n\nGenerated {len(files_dict)} output files including circuit analysis report."
        
        with open(f"{session_dir}/summary_report.txt", "w") as f:
            f.write(summary)
        
        files_dict["summary_report"] = f"{base_url}/{session_id}/summary_report.txt"
        
        return {
            "session_id": session_id,
            "status": "success",
            "message": response_text,
            "files": files_dict,
            "query": query
        }

@app.post("/simple-query")
async def simple_query(request: SimpleQueryRequest):
    """Endpoint for simple queries that don't require circuit analysis"""
    import random
    response_text = random.choice(SAMPLE_RESPONSES["simple"])
    
    return {
        "response": response_text,
        "type": "simple",
        "confidence": 0.95
    }

@app.post("/classify-query")
async def classify_query(request: SimpleQueryRequest):
    """Endpoint for query classification"""
    classification, confidence, reasoning = classify_query_complexity(request.query)
    
    return {
        "classification": classification,
        "confidence": confidence,
        "reasoning": reasoning
    }

@app.get("/sessions")
async def list_sessions():
    """List all sessions"""
    sessions = []
    if os.path.exists("sessions"):
        for session_file in os.listdir("sessions"):
            if session_file.endswith(".json"):
                session_id = session_file[:-5]  # Remove .json extension
                sessions.append({"id": session_id})
    return {"sessions": sessions}

@app.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get session information"""
    session_file = f"sessions/{session_id}.json"
    if os.path.exists(session_file):
        with open(session_file, "r") as f:
            return json.load(f)
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session"""
    session_file = f"sessions/{session_id}.json"
    if os.path.exists(session_file):
        os.remove(session_file)
        return {"message": "Session deleted"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Circuit Analysis Test Backend...")
    print("📡 Backend will be available at: http://localhost:8000")
    print("📋 API docs available at: http://localhost:8000/docs")
    print("🔧 Make sure your frontend is configured to connect to http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)