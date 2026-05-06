import { getReportsService } from './reports.service.js';

export async function getReports(req, res, next) {
  try {
    const { start, end } = req.query;
    const data = await getReportsService({ start, end });
    res.json(data);
  } catch (err) { next(err); }
}
