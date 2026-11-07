import express, { type Express, type ErrorRequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
app.set('trust proxy', 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
const handleError: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) { next(error); return; }
  const status = error?.type === 'entity.too.large' ? 413 : error instanceof SyntaxError ? 400 : 500;
  req.log.error({ errorType: error instanceof Error ? error.name : 'UnknownError', status }, 'Request failed');
  res.status(status).json({ error: status === 500 ? 'SERVER_ERROR' : 'INVALID_INPUT' });
};
app.use(handleError);

export default app;
