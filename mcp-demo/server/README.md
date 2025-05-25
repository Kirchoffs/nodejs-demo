# Notes
## Run
### Run TypeScript
In package.json, add the following script:
```json
"scripts": {
  "start": "ts-node index.ts"
}
```

```
>> npm install typescript ts-node --save-dev
>> npx tsc --init
```

#### Run the application using ts-node
```
>> npx ts-node index.ts
```

or
```
>> npm start
```

#### Run the application using JavaScript
```
>> npx tsc
// Check the output directory outDir in tsconfig.json
>> node dist/index.js
```

### Run MCP Inspector
#### Connect to MCP Inspector using SSE
You need to start the MCP server before running the inspector if you use SSE.
```
>> npx @modelcontextprotocol/inspector
```

#### Connect to MCP Inspector using STDIO
You do not need to start the MCP server before running the inspector if you use STDIO.
```
>> npx @modelcontextprotocol/inspector node <server_script_path>
```

## Workflow
1. User sends a question to the MCP client
2. MCP client gathers the tools from MCP server and merges them with the user's question, then sends it to the LLM
3. LLM generates a response with the tools it wants to use, and sends back to the MCP client
4. MCP client calls the tools and sends the tools response to the LLM
5. LLM generates a response based on the tools' responses, and sends back to the MCP client
6. MCP client sends the final response to the user

## Dependencies
### Express
```
>> npm install express
>> npm install @types/express --save-dev
```

`@types/express` is the type definition for Express. It provides TypeScript with the necessary type information for the Express library, allowing you to use Express in a type-safe manner.

## TypeScript
### Module Systems
#### ESM

#### CommonJS (CJS)
