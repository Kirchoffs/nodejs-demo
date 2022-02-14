## Reference 
https://github.com/weisrc/long-polling-chat  
https://www.youtube.com/watch?v=-cCX0nxMb_E

## Code Notes
### Endpoints
__/message__ endopoint is used to receive the message, and __/poll__ endpoint is used to send the message to all clients.

## General Knowledge
### Port Check
For MaxOS
```
>> lsof -i tcp:4999
>> kill -9 <PID>
```