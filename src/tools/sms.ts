import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';

import type { Tool } from '@modelcontextprotocol/sdk/types';

import { JustCallClient } from '../clients/justcall.js';

const sendSMSTool: Tool = {
  name: 'send_sms',
  description: 'Send an SMS message using JustCall',
  inputSchema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient phone number in E.164 format (e.g., +1234567890)'
      },
      from: {
        type: 'string',
        description: 'JustCall phone number to send from'
      },
      message: {
        type: 'string',
        description: 'SMS message content'
      }
    },
    required: ['to', 'from', 'message']
  }
};

export function registerSMSTools(server: Server, justCallClient: JustCallClient) {
  // Register tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [sendSMSTool]
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'send_sms':
        try {
          // Validate phone number format
          if (!args.to.startsWith('+')) {
            throw new Error('Phone number must be in E.164 format (start with +)');
          }

          // Validate message length
          if (args.message.length > 1600) {
            throw new Error('Message is too long (max 1600 characters)');
          }

          const result = await justCallClient.sendSMS({
            to: args.to,
            from: args.from,
            message: args.message
          });

          return {
            content: [
              {
                type: 'text',
                text: `✅ SMS sent successfully!

**Details:**
- Message ID: ${result.id || 'N/A'}
- To: ${args.to}
- From: ${args.from}
- Status: ${result.status || 'Sent'}
- Message: "${args.message}"

The SMS has been queued for delivery.`
              }
            ]
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to send SMS: ${error.message}

Please check:
- Your JustCall API credentials
- Phone number format (must start with +)
- JustCall phone number is valid
- Account has SMS credits`
              }
            ],
            isError: true
          };
        }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}