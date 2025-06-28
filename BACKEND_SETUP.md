# Backend Setup Guide for Circuit Analysis System

## Overview
Your frontend is configured to connect to a backend API running on `http://localhost:8000`. Here's how to set it up:

## Expected Backend Endpoints

Based on your frontend code, your backend should implement these endpoints:

### 1. Main Processing Endpoint
```
POST /process-query
Content-Type: application/json

Request Body:
{
  "query": "string",
  "endpoint": "auto" | "simple" | "classify" | "full" (optional)
}

Response:
{
  "session_id": "string",
  "status": "success" | "error" | "processing",
  "files": {
    "schema_diagram": "http://localhost:8000/files/session_id/diagram.png",
    "circuit_plot": "http://localhost:8000/files/session_id/plot.png", 
    "analysis_report": "http://localhost:8000/files/session_id/report.txt",
    "summary_report": "http://localhost:8000/files/session_id/summary.txt"
  },
  "message": "string",
  "error": "string" (if status is error)
}
```

### 2. Simple Query Endpoint
```
POST /simple-query
Content-Type: application/json

Request Body:
{
  "query": "string"
}

Response:
{
  "response": "string",
  "type": "simple",
  "confidence": 0.95
}
```

### 3. Classification Endpoint
```
POST /classify-query
Content-Type: application/json

Request Body:
{
  "query": "string"
}

Response:
{
  "classification": "simple" | "complex",
  "confidence": 0.95,
  "reasoning": "string"
}
```

### 4. File Serving
```
GET /files/{session_id}/{filename}
```
Should serve static files (images, reports, etc.)

### 5. Session Management
```
GET /session/{session_id}
GET /sessions
DELETE /session/{session_id}
```

## Quick Backend Setup Options

### Option 1: Python FastAPI Backend (Recommended)

Create a simple FastAPI backend to test the connection:

```python
# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uuid
import os

app = FastAPI()

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories for file storage
os.makedirs("files", exist_ok=True)
app.mount("/files", StaticFiles(directory="files"), name="files")

class QueryRequest(BaseModel):
    query: str
    endpoint: str = "auto"

class SimpleQueryRequest(BaseModel):
    query: str

@app.post("/process-query")
async def process_query(request: QueryRequest):
    session_id = str(uuid.uuid4())
    
    # Mock response - replace with your actual circuit analysis logic
    return {
        "session_id": session_id,
        "status": "success",
        "message": f"Processed query: {request.query}",
        "files": {
            # Add actual file URLs when you generate them
            # "schema_diagram": f"http://localhost:8000/files/{session_id}/diagram.png",
            # "circuit_plot": f"http://localhost:8000/files/{session_id}/plot.png"
        }
    }

@app.post("/simple-query")
async def simple_query(request: SimpleQueryRequest):
    return {
        "response": f"Simple response to: {request.query}",
        "type": "simple",
        "confidence": 0.95
    }

@app.post("/classify-query")
async def classify_query(request: SimpleQueryRequest):
    # Simple classification logic - replace with your AI model
    is_complex = len(request.query.split()) > 10 or any(word in request.query.lower() 
                    for word in ["analyze", "simulate", "design", "calculate"])
    
    return {
        "classification": "complex" if is_complex else "simple",
        "confidence": 0.85,
        "reasoning": "Based on query complexity and keywords"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

Install dependencies:
```bash
pip install fastapi uvicorn python-multipart
```

Run the backend:
```bash
python main.py
```

### Option 2: Node.js Express Backend

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use('/files', express.static('files'));

app.post('/process-query', (req, res) => {
    const { query, endpoint = 'auto' } = req.body;
    const sessionId = uuidv4();
    
    res.json({
        session_id: sessionId,
        status: 'success',
        message: `Processed query: ${query}`,
        files: {
            // Add actual file URLs when generated
        }
    });
});

app.post('/simple-query', (req, res) => {
    const { query } = req.body;
    res.json({
        response: `Simple response to: ${query}`,
        type: 'simple',
        confidence: 0.95
    });
});

app.post('/classify-query', (req, res) => {
    const { query } = req.body;
    const isComplex = query.split(' ').length > 10 || 
                     /analyze|simulate|design|calculate/i.test(query);
    
    res.json({
        classification: isComplex ? 'complex' : 'simple',
        confidence: 0.85,
        reasoning: 'Based on query complexity and keywords'
    });
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
```

Install dependencies:
```bash
npm init -y
npm install express cors uuid
```

Run:
```bash
node server.js
```

## Testing the Connection

1. **Start your backend** on port 8000
2. **Start your frontend** (should be on port 8080)
3. **Test the connection** by typing a message in the chat interface

## Integration with Your Agentic System

To integrate with your actual agentic circuit analysis system:

1. **Replace mock responses** with calls to your AI agents
2. **Generate actual circuit diagrams** and save them to the `files` directory
3. **Create analysis reports** in markdown format
4. **Return proper file URLs** in the API responses

## Debugging Connection Issues

If you encounter connection issues:

1. **Check CORS settings** in your backend
2. **Verify the backend is running** on port 8000
3. **Check browser console** for error messages
4. **Test API endpoints** directly with curl or Postman

Example curl test:
```bash
curl -X POST http://localhost:8000/simple-query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is a resistor?"}'
```

## Next Steps

1. Set up the basic backend using one of the options above
2. Test the connection with your frontend
3. Gradually integrate your actual circuit analysis logic
4. Add file generation for circuit diagrams and plots
5. Implement proper session management