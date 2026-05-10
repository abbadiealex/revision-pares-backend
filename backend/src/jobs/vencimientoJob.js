import cron from 'node-cron';
import { procesarVencidas } from '../services/vencimientoService.js';

export function startVencimientoJob() {
  const schedule = process.env.CRON_VENCIMIENTOS || '0 * * * *';

  return cron.schedule(
    schedule,
    async () => {
      await procesarVencidas();
    },
    {
      timezone: 'America/Mexico_City'
    }
  );
}
