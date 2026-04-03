// Store/Middleware/middlewares.js
import createSentryMiddleware from './createSentryMiddleware';

export default function (history) {
  const middlewareList = [];
  const sentryMiddleware = createSentryMiddleware();

  if (sentryMiddleware) {
    middlewareList.push(sentryMiddleware);
  }

  // Return ONLY the raw array
  return middlewareList;
}