import express from 'express';
import { corsOptions } from './cors.js';
import cors from 'cors';
import { i18n } from './i18n.js';
import { apiRouter } from './routes/apiRoutes.js';

const app = express();

function logRequest(req, _, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}


app.use(logRequest);
app.use(i18n.init);
app.use(cors(corsOptions));
app.use(express.json());
app.use(apiRouter);

export default app;
