const { createPipelineBuilder } = require('./trooba');

console.log('Normal pipeline:')

const pipeline = createPipelineBuilder()
  .use((req, next, ctx) => {
    console.log('Middleware 1 received request:', req);
    ctx.traceId = 't-' + Date.now();
    req.first_step = true;
    next();
  })
  .use((req, next, ctx) => {
    console.log('Middleware 2 received request:', req);
    console.log('Trace ID:', ctx.traceId);
    req.second_step = true;
    next();
  })
  .use((req, next, ctx) => {
    console.log('Middleware 3 received request:', req);
    console.log('Trace ID:', ctx.traceId);
    req.third_step = true;
    next();
  })
  .build();

pipeline.create().request({ foo: 'foo' }, (err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log(res);
  }
});

console.log('Error pipeline:')

const pipelineWithError = createPipelineBuilder()
  .use((req, next, ctx) => {
    console.log('Middleware 1 received request:', req);
    ctx.traceId = 't-' + Date.now();
    req.first_step = true;
    next(); // How does next() work? In trooba.js, next is implemented by the framework as a closure with some inner context variables.
  })
  .use((req, next, ctx) => {
    console.log('Middleware 2 received request:', req);
    console.log('Trace ID:', ctx.traceId);
    req.second_step = true;
    next('Error in middleware 2');
  })
  .use((req, next, ctx) => {
    console.log('Middleware 3 received request:', req);
    console.log('Trace ID:', ctx.traceId);
    req.third_step = true;
    next();
  })
  .build();

pipelineWithError.create().request({ foo: 'foo' }, (err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log(res);
  }
});
