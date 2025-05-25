import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const app = express();

const mcpServer = new McpServer({
  name: 'Hacker News',
  version: '1.1.1',
});

mcpServer.tool(
  'get_hacker_news_stories',
  'Get the stories from Hacker News',
  {
    type: z.enum(['topstories', 'newstories', 'beststories']).default('topstories'),
    amount: z.number().min(1).max(500).default(10),
  },
  async ({ type, amount }) => {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/${type}.json`);
    const ids = await response.json();
    const stories = await Promise.all(ids.slice(0, amount).map(async (id: number) => {
      const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      return storyResponse.json();
    }));

    return {
      content: stories.map((story) => ({
        type: 'text',
        text: JSON.stringify(story),
      }))
    };
  }
);

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

let sseTransport: SSEServerTransport | null = null;

app.get('/sse', (req, res) => {
  sseTransport = new SSEServerTransport("/messages", res);
  mcpServer.connect(sseTransport);
});

app.post('/messages', (req, res) => {
  if (sseTransport) {
    sseTransport.handlePostMessage(req, res);
  }
});

app.listen(6174, () => {
  console.log('Server is running on http://localhost:6174');
});

const stdioTransport = new StdioServerTransport();
mcpServer.connect(stdioTransport);
