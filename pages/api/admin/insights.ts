import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const insights = await Database.getPlatformInsights();
        return res.status(200).json({ success: true, insights });
    } catch (error) {
        console.error('Get insights error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default Auth.requireAdmin(handler);
