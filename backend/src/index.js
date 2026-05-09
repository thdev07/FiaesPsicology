import app from './app.js';
import { startRemindersJob } from './jobs/reminders.job.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startRemindersJob();
});
