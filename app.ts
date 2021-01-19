import path from 'path';
import { promisify } from 'util';
import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request } from 'express';
import expressWs from '@small-tech/express-ws';
import config from './config';
import router from './router';
import cacheControl from 'express-cache-controller';
import timeout from 'connect-timeout';
import logger from './logger';
import expressPino from 'express-pino-logger';

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}

interface LoadedRequest extends Request {
  user: {};
  login: Function;
}

// Set up Sentry error tracking
Sentry.init({
  dsn: config.sentryDsn,
  environment: config.NODE_ENV
});

// Express App
const app = express();

const expressLogger = expressPino({ logger })
app.use(expressLogger)

app.use(timeout(300000));

/**
 * Account for nginx proxy when getting client's IP address
 * http://expressjs.com/en/guide/behind-proxies.html
 */
app.set('trust proxy', true);

// Setup middleware
app.use(Sentry.Handlers.requestHandler()); // The Sentry request handler must be the first middleware on the app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.sessionSecret));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: config.NODE_ENV === 'dev' ? ['Date'] : undefined
  })
);
// for now, send directive to never cache to prevent Zwibbler issues
// until we figure out a caching strategy
app.use(cacheControl({
  noCache: true
}));
app.use(haltOnTimedout);
// see https://stackoverflow.com/questions/51023943/nodejs-getting-username-of-logged-in-user-within-route
app.use((req: LoadedRequest, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Make req.login async
app.use((req: LoadedRequest, res, next): void => {
  req.login = promisify(req.login);
  next();
});

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// initialize Express WebSockets
expressWs(app);

// Load server router
router(app);
app.use(haltOnTimedout);

// Send error responses to API requests after they are passed to Sentry
app.use(
  ['/api', '/auth', '/contact', '/school', '/twiml', '/whiteboard'], haltOnTimedout,
  (err, req, res, next) => {
    res.status(err.httpStatus || 500).json({ err: err.message || err });
    next();
  }
);
app.use(haltOnTimedout);

export default app;
