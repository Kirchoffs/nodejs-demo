# Notes

## Run
```
>> npx ts-node index.ts <server_script_path>
```

## Miscellaneous
#### Difference between `export TOKEN=token` and `TOKEN=token`
- `export TOKEN=token`: This sets the variable and exports it to the environment, making it available to child processes. Any program or script launched after this will be able to access the TOKEN environment variable.
- `TOKEN=token`: This sets a local shell variable but it is not visible to child processes. Only the current shell session can access this variable. If you run a command after this, it won't see the TOKEN variable unless you export it.

#### Gemini OpenAI compatibility
- base url: `https://generativelanguage.googleapis.com/v1beta/openai/`
- model: `gemini-2.5-flash`
