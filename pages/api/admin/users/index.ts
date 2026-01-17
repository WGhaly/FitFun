import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // GET - List all users
    if (req.method === 'GET') {
        try {
            const users = await Database.getAllUsers();
            // Remove password hashes from response
            const sanitizedUsers = users.map((user: any) => {
                const { passwordHash, ...rest } = user;
                return rest;
            });
            return res.status(200).json({ success: true, users: sanitizedUsers });
        } catch (error) {
            console.error('Get users error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // PUT - Update user
    if (req.method === 'PUT') {
        try {
            const { id } = req.query;
            const updates = req.body;

            if (!id) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const user = await Database.updateUser(id as string, updates);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const { passwordHash, ...sanitizedUser } = user;
            return res.status(200).json({ success: true, user: sanitizedUser });
        } catch (error) {
            console.error('Update user error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

export default Auth.requireAdmin(handler);
