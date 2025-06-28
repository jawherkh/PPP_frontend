const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Create directories
const filesDir = path.join(__dirname, 'files');
const sessionsDir = path.join(__dirname, 'sessions');

if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir, { recursive: true });
}
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

// Serve static files
app.use('/files', express.static(filesDir));

// Sample responses for testing
const SAMPLE_RESPONSES = {
  simple: [
    "A resistor is a passive electronic component that limits current flow.",
    "Ohm's law states that V = I × R, where V is voltage, I is current, and R is resistance.",
    "Capacitors store electrical energy in an electric field between two conductive plates.",
    "An inductor is a passive component that stores energy in a magnetic field.",
    "Voltage is the electrical potential difference between two points in a circuit.",
    "Current is the flow of electric charge through a conductor, measured in amperes."
  ],
  complex: [
    "I'll analyze this circuit for you. Let me generate the schematic and run simulations.",
    "This requires a detailed circuit analysis. I'll create the circuit diagram and calculate the frequency response.",
    "I'll design this circuit and provide a comprehensive analysis with plots and calculations.",
    "Let me perform a complete circuit analysis including DC operating point and AC response."
  ]
};

const SAMPLE_REPORTS = {
  rc_circuit: `# RC Low-Pass Filter Analysis

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
3. Add buffer amplifiers to prevent loading effects`,

  amplifier: `# BJT Amplifier Circuit Analysis

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
The amplifier provides good voltage gain with moderate input impedance.`
};

// Helper functions
function classifyQuery(query) {
  const queryLower = query.toLowerCase();
  
  const complexKeywords = [
    'analyze', 'design', 'simulate', 'calculate', 'frequency response',
    'transfer function', 'bode plot', 'circuit diagram', 'schematic',
    'amplifier', 'filter', 'oscillator', 'power supply'
  ];
  
  const simpleKeywords = [
    'what is', 'define', 'explain', 'how does', 'basic', 'simple'
  ];
  
  const complexScore = complexKeywords.filter(keyword => queryLower.includes(keyword)).length;
  const simpleScore = simpleKeywords.filter(keyword => queryLower.includes(keyword)).length;
  const wordCount = query.split(' ').length;
  
  if (complexScore > 0 || wordCount > 15) {
    return {
      classification: 'complex',
      confidence: Math.min(0.8 + complexScore * 0.1, 1.0),
      reasoning: `Contains ${complexScore} complex keywords`
    };
  } else if (simpleScore > 0 || wordCount < 8) {
    return {
      classification: 'simple',
      confidence: Math.min(0.7 + simpleScore * 0.1, 1.0),
      reasoning: `Contains ${simpleScore} simple keywords`
    };
  } else {
    return {
      classification: 'simple',
      confidence: 0.6,
      reasoning: 'Default classification based on length'
    };
  }
}

function createSampleReport(query) {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('rc') || queryLower.includes('resistor') || 
      queryLower.includes('capacitor') || queryLower.includes('filter')) {
    return SAMPLE_REPORTS.rc_circuit;
  } else if (queryLower.includes('amplifier') || queryLower.includes('transistor') || 
             queryLower.includes('bjt') || queryLower.includes('gain')) {
    return SAMPLE_REPORTS.amplifier;
  } else {
    return SAMPLE_REPORTS.rc_circuit; // Default
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Circuit Analysis Backend API',
    status: 'running',
    endpoints: ['/process-query', '/simple-query', '/classify-query'],
    docs: 'Visit /docs for API documentation'
  });
});

app.post('/process-query', (req, res) => {
  const { query, endpoint = 'auto' } = req.body;
  const sessionId = uuidv4();
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  const classification = classifyQuery(query);
  
  // Route based on endpoint parameter
  if (endpoint === 'simple' || (endpoint === 'auto' && classification.classification === 'simple')) {
    // Simple response
    const responseText = SAMPLE_RESPONSES.simple[Math.floor(Math.random() * SAMPLE_RESPONSES.simple.length)];
    return res.json({
      session_id: sessionId,
      status: 'success',
      message: responseText,
      query: query
    });
  }
  
  if (endpoint === 'classify') {
    // Classification only
    return res.json({
      session_id: sessionId,
      status: 'success',
      message: `**Query Classification:**\n\n**Type:** ${classification.classification}\n**Confidence:** ${Math.round(classification.confidence * 100)}%\n**Reasoning:** ${classification.reasoning}`,
      query: query
    });
  }
  
  // Full analysis (complex response)
  const responseText = SAMPLE_RESPONSES.complex[Math.floor(Math.random() * SAMPLE_RESPONSES.complex.length)];
  const files = {};
  const baseUrl = `http://localhost:${PORT}/files`;
  
  // Create session directory
  const sessionDir = path.join(filesDir, sessionId);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }
  
  // Generate analysis report
  const reportContent = createSampleReport(query);
  const reportPath = path.join(sessionDir, 'analysis_report.txt');
  fs.writeFileSync(reportPath, reportContent);
  files.analysis_report = `${baseUrl}/${sessionId}/analysis_report.txt`;
  
  // Generate summary
  const summary = `Analysis complete for: ${query}\n\nGenerated analysis report with circuit parameters and recommendations.`;
  const summaryPath = path.join(sessionDir, 'summary_report.txt');
  fs.writeFileSync(summaryPath, summary);
  files.summary_report = `${baseUrl}/${sessionId}/summary_report.txt`;
  
  // Simulate circuit diagram and plots for certain queries
  if (query.toLowerCase().includes('circuit') || query.toLowerCase().includes('schematic')) {
    files.schema_diagram = `${baseUrl}/${sessionId}/circuit_diagram.png`;
  }
  
  if (query.toLowerCase().includes('plot') || query.toLowerCase().includes('frequency') || 
      query.toLowerCase().includes('analyze')) {
    files.circuit_plot = `${baseUrl}/${sessionId}/frequency_plot.png`;
  }
  
  res.json({
    session_id: sessionId,
    status: 'success',
    message: responseText,
    files: files,
    query: query
  });
});

app.post('/simple-query', (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  const responseText = SAMPLE_RESPONSES.simple[Math.floor(Math.random() * SAMPLE_RESPONSES.simple.length)];
  
  res.json({
    response: responseText,
    type: 'simple',
    confidence: 0.95
  });
});

app.post('/classify-query', (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  const classification = classifyQuery(query);
  
  res.json({
    classification: classification.classification,
    confidence: classification.confidence,
    reasoning: classification.reasoning
  });
});

app.get('/sessions', (req, res) => {
  const sessions = [];
  if (fs.existsSync(sessionsDir)) {
    const sessionFiles = fs.readdirSync(sessionsDir).filter(file => file.endsWith('.json'));
    sessionFiles.forEach(file => {
      const sessionId = file.replace('.json', '');
      sessions.push({ id: sessionId });
    });
  }
  res.json({ sessions });
});

app.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const sessionFile = path.join(sessionsDir, `${sessionId}.json`);
  
  if (fs.existsSync(sessionFile)) {
    const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    res.json(sessionData);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

app.delete('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const sessionFile = path.join(sessionsDir, `${sessionId}.json`);
  
  if (fs.existsSync(sessionFile)) {
    fs.unlinkSync(sessionFile);
    res.json({ message: 'Session deleted' });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Circuit Analysis Backend Started!');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log('🔧 Frontend should connect to this URL');
  console.log('📋 Test the API:');
  console.log(`   curl -X POST http://localhost:${PORT}/simple-query -H "Content-Type: application/json" -d '{"query":"What is a resistor?"}'`);
});