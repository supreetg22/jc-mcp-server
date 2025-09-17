import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { JustCallClient } from './clients/justcall.js';
import { registerSMSTools } from './tools/sms.js';

dotenv.config();
        
const app = express();
app.use(cors());
app.use(express.json());

// Validate environment variables
const requiredEnvVars = ['JUSTCALL_API_KEY', 'JUSTCALL_API_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize JustCall client
const justCallClient = new JustCallClient(
  process.env.JUSTCALL_API_KEY!,
  process.env.JUSTCALL_API_SECRET!
);

// Create MCP server
const mcpServer = new Server({
  name: 'jc-mcp-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Register SMS tools
registerSMSTools(mcpServer, justCallClient);

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'JustCall MCP Server',
    version: '1.0.0',
    description: 'Model Context Protocol server for JustCall SMS API',
    endpoints: {
      mcp: '/mcp (Server-Sent Events)',
      health: '/health'
    },
    tools: ['send_sms']
  });
});

app.get('/health', async (req, res) => {
  try {
    const isValid = await justCallClient.validateCredentials();
    res.json({ 
      status: 'ok',
      justcall_connection: isValid ? 'connected' : 'error',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      justcall_connection: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

// SSE endpoint for MCP
app.get('/mcp', async (req, res) => {
  console.log('🔌 New MCP connection established');
  
  try {
    const transport = new SSEServerTransport('/mcp', res);
    await mcpServer.connect(transport);
    console.log('✅ MCP server connected via SSE');
  } catch (error) {
    console.error('❌ MCP connection error:', error);
    res.status(500).json({ error: 'Failed to establish MCP connection' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('🚀 JustCall MCP Server started');
    console.log(`📡 SSE endpoint: http://localhost:${PORT}/mcp`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log(`📖 Server info: http://localhost:${PORT}/`);
  });
}

// Export for Vercel
export default app;