import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import path from 'path';
import apiRoutes from './routes/index.js';
import { connectDb } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { startVencimientoJob } from './jobs/vencimientoJob.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' }, error: null, code: 'OK' });
});

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  connectDb()
    .then(() => {
      startVencimientoJob();
      app.listen(port, () => {
        console.log(`API escuchando en http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error('No fue posible iniciar la API:', error.message);
      process.exit(1);
    });
}

export default app;
