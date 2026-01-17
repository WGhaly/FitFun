import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // GET - List measurements for the user
    if (req.method === 'GET') {
        try {
            const user = Auth.getUserFromRequest(req);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { competitionId } = req.query;
            const measurements = await Database.getUserMeasurements(
                user.userId,
                competitionId as string || null
            );

            return res.status(200).json({ success: true, measurements });
        } catch (error) {
            console.error('Get measurements error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST - Create measurement
    if (req.method === 'POST') {
        try {
            const user = Auth.getUserFromRequest(req);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const {
                competitionId,
                weight,
                bodyFatPercentage,
                bmi,
                measurementDate
            } = req.body;

            if (!weight || !measurementDate) {
                return res.status(400).json({ error: 'Weight and measurement date are required' });
            }

            const measurement = await Database.createMeasurement({
                user_id: user.userId,
                competition_id: competitionId || null,
                weight,
                body_fat_percentage: bodyFatPercentage || null,
                bmi: bmi || null,
                measurement_date: measurementDate
            });

            return res.status(201).json({ success: true, measurement });
        } catch (error) {
            console.error('Create measurement error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
