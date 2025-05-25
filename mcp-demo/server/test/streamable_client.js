import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

let client = undefined;
const baseUrl = 'http://localhost:9973/streamable';
try {
  client = new Client({
    name: 'streamable-client',
    version: '1.1.1',
  });

  const transport = new StreamableHTTPClientTransport(new URL(baseUrl));
  await client.connect(transport);

  console.log(`Connected using Streamable to ${baseUrl}`);
  client.fallbackNotificationHandler = notification => {
    console.log(notification);
  }

  const tools = await client.listTools();
  console.log('Available tools:', tools);

  const dynymicResources = await client.listResourceTemplates();
  console.log('Available dynamic resources:', dynymicResources);

  const dybamicResourceResponse = await client.readResource({ uri: 'greeting://World' });
  console.log('Dynamic resource response:', dybamicResourceResponse);
} catch (error) {
  console.log(`Streamable HTTP connection failed`);
}
