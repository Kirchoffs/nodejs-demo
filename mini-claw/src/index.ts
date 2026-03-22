import OpenAI from 'openai';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const client = new OpenAI({
  apiKey: process.env['DEEPSEEK_KEY'],
  baseURL: process.env['DEEPSEEK_BASE_URL'],
});

const rl = readline.createInterface({ input, output });

function dedent(content: string) {
    const lines = content.split('\n');
    const dedentedLines = lines.map(line => line.trim());
    return dedentedLines.join('\n').trim();
}

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content: dedent(
        `
        You are a helpful coding assistant.
        You can respond in two formats:
        1. "command:<shell command>": If you need to execute a command to get information or perform an action.
        2. "text:<your message>": If you want to talk to the user.

        When you issue a command, the system will execute it and give you back the output. You can then decide to run another command or give a final text response.
        Always start your reply with either "command:" or "text:".
        `
    )
  }
];

function startLoading() {
  const chars = ['⠙', '⠘', '⠰', '⠴', '⠤', '⠦', '⠆', '⠃', '⠋', '⠉'];
  let i = -1;
  return setInterval(() => {
    process.stdout.write(`\r${chars[++i % chars.length]}`);
  }, 128);
}

function stopLoading(intervalId: NodeJS.Timeout) {
  clearInterval(intervalId);
  process.stdout.write('\r\x1b[K'); 
}

console.log("Chat started. Type 'exit' or 'quit' to stop.\n");

while (true) {
  const userInput = await rl.question('You: ');

  if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
    break;
  }

  messages.push({ role: 'user', content: userInput });

  let processing = true;
  while (processing) {
    const loadingInterval = startLoading();
    try {
      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: messages,
      });

      stopLoading(loadingInterval);
      const fullResponse = response.choices[0].message.content || '';

      if (fullResponse.startsWith('command:')) {
        const cmd = fullResponse.replace('command:', '').trim();
        console.log(`\x1b[33mExecuting: ${cmd}\x1b[0m`);

        const toolLoadingInterval = startLoading();
        try {
          const { stdout, stderr } = await execAsync(cmd);
          const cmdOutput = stdout || stderr || '(no output)';
          messages.push({ role: 'assistant', content: fullResponse });
          messages.push({ role: 'user', content: `Command output:\n${cmdOutput}` });
        } catch (error: any) {
          messages.push({ role: 'assistant', content: fullResponse });
          messages.push({ role: 'user', content: `Command failed with error:\n${error.message}` });
        }
        stopLoading(toolLoadingInterval);
      } else if (fullResponse.startsWith('text:')) {
        const text = fullResponse.replace('text:', '').trim();
        console.log(`Assistant: ${text}\n`);
        messages.push({ role: 'assistant', content: fullResponse });
        processing = false;
      } else {
        console.log(`Assistant: ${fullResponse}\n`);
        messages.push({ role: 'assistant', content: fullResponse });
        processing = false;
      }
    } catch (error) {
      stopLoading(loadingInterval);
      console.error('Error:', error);
      processing = false;
    }
  }
}

rl.close();
