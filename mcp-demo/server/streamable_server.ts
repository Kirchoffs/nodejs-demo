import express from 'express';
import { randomUUID } from 'node:crypto';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const app = express();
app.use(express.json());

const streamableTransports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

app.post('/streamable', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && streamableTransports[sessionId]) {
        transport = streamableTransports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId) => {
                streamableTransports[sessionId] = transport;
            }
        });

        transport.onclose = () => {
            if (transport.sessionId) {
                delete streamableTransports[transport.sessionId];
            }
        };

        const mcpServer = new McpServer({
            name: 'Streamable Server',
            version: '1.1.1',
        });

        mcpServer.tool(
          'test_purpose_add',
          'Add two numbers',
          {
            a: z.number(),
            b: z.number(),
          },
          async ({ a, b }) => {
            return {
              content: [{
                type: 'text',
                text: String(a + b),
              }]
            };
          }
        );
        
        mcpServer.resource(
          'test_purpose_greet',
          new ResourceTemplate('greeting://{name}', { list: undefined }),
          async (uri, variables) => ({
            contents: [{
              uri: uri.href,
              text: `Hello, ${variables.name}!`,
            }]
          })
        );

        await mcpServer.connect(transport);
    } else {
        res.status(400).json({
            jsonrpc: '2.0',
            error: {
                message: 'Invalid session ID or request type',
            },
            id: null,
        });
        return;
    }

    await transport.handleRequest(req, res, req.body);
});

const handlerSessionRequest = async (req: express.Request, res: express.Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !streamableTransports[sessionId]) {
        res.status(400).send('Session ID not found');
        return;
    }
    
    const transport = streamableTransports[sessionId];
    await transport.handleRequest(req, res);
};

app.get('/streamable', handlerSessionRequest);
app.delete('/streamable', handlerSessionRequest);

app.listen(9973, () => {
    console.log('Streamable server is running on http://localhost:9973/streamable');
});
