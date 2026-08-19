// Wraps an async route handler so a rejected promise (e.g. a DB call that
// times out because Mongo isn't connected) is passed to Express's error
// handler via next(err) — instead of becoming an unhandled rejection that
// hangs the request or, on newer Node versions, crashes the whole process.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
