import dotenv from 'dotenv';
dotenv.config();

async function testServer() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing JustCall MCP Server...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('🔗 JustCall connection:', healthData.justcall_connection);

    // Test 2: Server info
    console.log('\n2. Testing server info...');
    const infoResponse = await fetch(`${baseURL}/`);
    const infoData = await infoResponse.json();
    console.log('✅ Server info:', infoData.name);

    // Test 3: SSE connection
    console.log('\n3. Testing SSE connection...');
    const sseResponse = await fetch(`${baseURL}/mcp`, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });

    if (sseResponse.ok) {
      console.log('✅ SSE connection successful');
    } else {
      console.log('❌ SSE connection failed:', sseResponse.status);
    }

    console.log('\n🎉 All tests completed!');
    console.log('\nNext steps:');
    console.log('1. Test with MCP Inspector: npx @modelcontextprotocol/inspector sse http://localhost:3000/mcp');
    console.log('2. Deploy to Vercel');
    console.log('3. Add to Claude.ai Custom Connectors');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testServer();