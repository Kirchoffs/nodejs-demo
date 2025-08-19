function createPipelineBuilder() {
  const handlers = []

  function use(handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function')
    }
    handlers.push(handler)
    return api;
  }

  function build() {
    return {
      create() {
        const ctx = Object.create(null);

        return {
          request(request, cb) {
            let finished = false;

            const done = (err, res) => {
              if (finished) {
                return;
              }
              
              finished = true;
              cb && cb(err, res);
            }

            const dispatch = (index) => {
              if (finished) {
                return;
              }

              if (index >= handlers.length) {
                return done(null, request);
              }

              const handler = handlers[index];

              try {
                handler(request, function next(err, res) {
                  if (arguments.length > 0) {
                    return done(err, res);
                  }

                  dispatch(index + 1);
                }, ctx);
              } catch (err) {
                done(err);
              }
            };

            dispatch(0);
          }
        }
      }
    }
  }

  const api = {
    use,
    build
  }

  return api
}

module.exports = { createPipelineBuilder };
