import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as dashboardService from '../services/dashboardService';

export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { role, userId } = req.user!;
    let data;

    if (role === 'hr') {
      data = await dashboardService.getHRDashboard();
    } else if (role === 'mentor') {
      data = await dashboardService.getMentorDashboard(userId);
    } else {
      data = await dashboardService.getEmployeeDashboard(userId);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
}
