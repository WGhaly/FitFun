import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await Database.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await Auth.verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = Auth.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        // Set auth cookie
        Auth.setAuthCookie(res, token);

        // Return user data (without password hash)
        const { password_hash, ...userData } = user;

        return res.status(200).json({
            success: true,
            user: userData,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
