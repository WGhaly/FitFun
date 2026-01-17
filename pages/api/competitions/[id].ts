import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    // GET - Get competition details
    if (req.method === 'GET') {
        try {
            const competition = await Database.getCompetitionById(id);
            if (!competition) {
                return res.status(404).json({ error: 'Competition not found' });
            }
            return res.status(200).json({ success: true, competition });
        } catch (error) {
            console.error('Get competition error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // PUT - Update competition (Admin only)
    if (req.method === 'PUT') {
        try {
            const user = Auth.getUserFromRequest(req);
            if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
                return res.status(403).json({ error: 'Forbidden: Admin access required' });
            }

            const updates = req.body;
            const updated = await Database.updateCompetition(id, updates);

            return res.status(200).json({ success: true, competition: updated });
        } catch (error) {
            console.error('Update competition error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // DELETE - Remove competition (Super Admin only for safety)
    if (req.method === 'DELETE') {
        try {
            const user = Auth.getUserFromRequest(req);
            if (!user || user.role !== 'super_admin') {
                return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
            }

            // In our system, we might prefer canceling over deleting to preserve history, 
            // but for production completeness, we implement delete.
            // Note: Database implementation might need to handle participants/measurements cleanup if not handled by DB constraints.
            await Database.deleteCompetition(id);

            return res.status(200).json({ success: true, message: 'Competition deleted' });
        } catch (error) {
            console.error('Delete competition error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
