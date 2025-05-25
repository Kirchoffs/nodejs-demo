import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['./dist/sse_stdio_server.js'],
});

const client = new Client({
  name: 'stdio-client',
  version: '1.1.1',
});

await client.connect(transport);

const tools = await client.listTools();
console.log('Available tools:', tools);

const dynymicResources = await client.listResourceTemplates();
console.log('Available dynamic resources:', dynymicResources);

const dybamicResourceResponse = await client.readResource({ uri: 'greeting://World' });
console.log('Dynamic resource response:', dybamicResourceResponse);
