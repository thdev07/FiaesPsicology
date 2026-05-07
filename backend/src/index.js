import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import patientsRoutes from './modules/patients/patients.routes.js';
import roomsRoutes from './modules/rooms/rooms.routes.js';
import appointmentsRoutes from './modules/appointments/appointments.routes.js';
import medicalRecordsRoutes from './modules/medical-records/medical-records.routes.js';
import transactionsRoutes from './modules/financial/transactions.routes.js';
import insuranceRoutes from './modules/insurance/insurance.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';

import { errorMiddleware } from './middlewares/error.middleware.js';
import { startRemindersJob } from './jobs/reminders.job.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'API Fiaes Psicology - OK' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);
app.use('/api/financial', transactionsRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/reports', reportsRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startRemindersJob();
});
