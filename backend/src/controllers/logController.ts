import { Request, Response } from 'express';
import { LogModel } from '../models/log';

export const getLogs = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string || '20');
    const { logs, isFallback } = await LogModel.getAll(limit);
    
    res.json({
      success: true,
      datasource: isFallback ? 'simulated-fallback' : 'mysql-live',
      logs
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
