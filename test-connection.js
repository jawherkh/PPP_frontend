// Simple test to verify backend connection
const testBackend = async () => {
  try {
    console.log('🔍 Testing backend connection...');
    
    // Test basic endpoint
    const response = await fetch('http://localhost:8000/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is running!');
      console.log('📋 Response:', data);
      
      // Test simple query
      console.log('\n🧪 Testing simple query...');
      const queryResponse = await fetch('http://localhost:8000/simple-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'What is a resistor?' })
      });
      
      if (queryResponse.ok) {
        const queryData = await queryResponse.json();
        console.log('✅ Simple query works!');
        console.log('📝 Response:', queryData);
      } else {
        console.log('❌ Simple query failed:', queryResponse.status);
      }
      
    } else {
      console.log('❌ Backend not responding:', response.status);
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('💡 Make sure the backend is running on port 8000');
  }
};

// Run the test
testBackend();