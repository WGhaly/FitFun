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
        const { email, password, realName, displayName, weight, height, country, city } = req.body;

        // Validate required fields
        if (!email || !password || !realName || !displayName) {
            return res.status(400).json({
                error: 'Email, password, real name, and display name are required'
            });
        }

        // Validate email
        if (!Auth.validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Validate password
        const passwordValidation = Auth.validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        // Check if user already exists
        const existingUser = await Database.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }

        // Hash password
        const passwordHash = await Auth.hashPassword(password);

        // Create user
        const user = await Database.createUser({
            email,
            passwordHash,
            realName,
            displayName,
            weight: weight || null,
            height: height || null,
            country: country || null,
            city: city || null
        });

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

        return res.status(201).json({
            success: true,
            user: userData,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
