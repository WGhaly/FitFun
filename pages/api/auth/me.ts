import type { NextApiRequest, NextApiResponse } from 'next';
import { Auth } from '@/lib/auth';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = Auth.getUserFromRequest(req);

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
