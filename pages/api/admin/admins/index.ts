import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // GET - List all admins
    if (req.method === 'GET') {
        try {
            const admins = await Database.getAllAdmins();
            // Remove password hashes
            const sanitizedAdmins = admins.map((admin: any) => {
                const { passwordHash, ...rest } = admin;
                return rest;
            });
            return res.status(200).json({ success: true, admins: sanitizedAdmins });
        } catch (error) {
            console.error('Get admins error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST - Create admin
    if (req.method === 'POST') {
        try {
            const { email, password, role, name } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({ error: 'Email, password, and name are required' });
            }

            const passwordHash = await Auth.hashPassword(password);
            const admin = await Database.createAdmin({
                email,
                password_hash: passwordHash,
                role: role || 'admin',
                name,
                must_reset_password: true,
                created_by: (req as any).user.userId
            });

            const { passwordHash: _, ...sanitizedAdmin } = admin;
            return res.status(201).json({ success: true, admin: sanitizedAdmin });
        } catch (error) {
            console.error('Create admin error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

export default Auth.requireSuperAdmin(handler);
