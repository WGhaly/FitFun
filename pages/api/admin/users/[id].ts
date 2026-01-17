import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    // GET - Get user details
    if (req.method === 'GET') {
        try {
            const user = await Database.getUserById(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const { passwordHash, ...sanitizedUser } = user;
            return res.status(200).json({ success: true, user: sanitizedUser });
        } catch (error) {
            console.error('Get user error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // DELETE - Remove user
    if (req.method === 'DELETE') {
        try {
            // For safety in production, we might want to check if the user has active competitions,
            // but for now we follow the "delete" instruction.
            await Database.deleteUser(id);
            return res.status(200).json({ success: true, message: 'User deleted' });
        } catch (error) {
            console.error('Delete user error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

export default Auth.requireAdmin(handler);
