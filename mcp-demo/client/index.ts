import dotenv from 'dotenv';
import fs from 'fs';
import OpenAI from 'openai';
import readline from 'readline';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const envEntries = dotenv.parse(fs.readFileSync('.env'));
for (const envKey in envEntries) {
  if (envEntries[envKey] !== '') {
    process.env[envKey] = envEntries[envKey];
  } else {
    console.log(`Environment variable ${envKey} is not set in the .env file.`);
  }
}

console.log(process.env.OPENAI_API_KEY ? 'API key is set.' : 'API key is not set.');
console.log(process.env.OPENAI_BASE_URL ? 'Base URL is set.' : 'Base URL is not set.');
console.log(process.env.OPENAI_MODEL ? `Using model: ${process.env.OPENAI_MODEL}` : 'Model is not set.');

class MCPClient {
  private openai: OpenAI;
  private client: Client;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    this.client = new Client({
      name: 'mcp-typescript-client',
      version: '1.1.1',
    });
  }

  async connectToServer(serverScriptPath: string) {
    const isPython = serverScriptPath.endsWith('.py');
    const isJs = serverScriptPath.endsWith('.js');

    if (!isPython && !isJs) {
      throw new Error('Server script must be a Python or JavaScript file');
    }

    const command = isPython ? 'python' : 'node';

    const transport = new StdioClientTransport({
      command,
      args: [serverScriptPath],
    });

    await this.client.connect(transport);

    const tools = (await this.client.listTools()).tools as unknown as Tool[];
    console.log('\n');
    console.log("Connected to server with tools:", tools.map(tool => tool.name));
  }

  async processQuery(query: string): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: query,
      },
    ];

    const tools = (await this.client.listTools()).tools as unknown as Tool[];
    const availableTools = tools.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name as string,
        description: tool.description as string,
        parameters: {
          type: 'object',
          properties: tool.inputSchema.properties as Record<string, unknown>,
          required: tool.inputSchema.required as string[],
        },
      }
    }));

    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL as string,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that can call tools to get information.',
        },
        ...messages,
      ],
      tools: availableTools
    });

    const finalText: string[] = [];

    if (response.choices[0].message.tool_calls) {
      for (const toolCall of response.choices[0].message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        const tool = tools.find(t => t.name === toolName);
        if (!tool) {
          throw new Error(`Tool ${toolName} not found`);
        }

        const result = await this.client.callTool({
          name: toolName,
          arguments: toolArgs,
        });
        console.log(`Tool ${toolName} called with arguments:`, toolArgs);

        messages.push(response.choices[0].message);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result.content),
        } as ChatCompletionMessageParam);
      }

      const nextResponse = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL as string,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that can call tools to get information.',
          },
          ...messages,
        ],
        tools: availableTools,
      });

      finalText.push(nextResponse.choices[0].message.content || '');
    } else {
      finalText.push(response.choices[0].message.content || '');
    }

    return finalText.join('\n');
  }

  async chatLoop() {
    console.log('\n');
    console.log('MCP client started.');
    console.log('Type your query or `quit` to exit.');

    const inout = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    while (true) {
      const query = await new Promise<string>((resolve) => {
        inout.question('Query: ', resolve);
      });

      if (query.toLowerCase() === 'quit') {
        break;
      }

      try {
        const response = await this.processQuery(query);
        console.log(response);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
      }
    }

    console.log('Exiting chat loop.');
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
    }
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log('Usage: npx ts-node index.ts <server_script_path>');
    process.exit(1);
  }

  const client = new MCPClient();
  try {
    await client.connectToServer(process.argv[2]);
    await client.chatLoop();
  } catch (error) {
    await client.cleanup();
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
