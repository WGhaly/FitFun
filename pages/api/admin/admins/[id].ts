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

    // DELETE - Remove admin
    if (req.method === 'DELETE') {
        try {
            // Cannot delete yourself
            if (id === (req as any).user.userId) {
                return res.status(400).json({ error: 'Cannot delete your own account' });
            }

            await Database.deleteAdmin(id);
            return res.status(200).json({ success: true, message: 'Admin deleted' });
        } catch (error) {
            console.error('Delete admin error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST - Reset password
    if (req.method === 'POST' && req.body.action === 'reset-password') {
        try {
            const { newPassword } = req.body;
            if (!newPassword) {
                return res.status(400).json({ error: 'New password is required' });
            }

            const passwordHash = await Auth.hashPassword(newPassword);
            await Database.updateAdmin(id, {
                passwordHash,
                mustResetPassword: true
            });

            return res.status(200).json({ success: true, message: 'Password reset' });
        } catch (error) {
            console.error('Reset admin password error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

export default Auth.requireSuperAdmin(handler);
