import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}

export class Auth {
    // Hash password
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    // Verify password
    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    // Generate JWT token
    static generateToken(payload: JWTPayload): string {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: '7d' // Token expires in 7 days
        });
    }

    // Verify JWT token
    static verifyToken(token: string): JWTPayload | null {
        try {
            return jwt.verify(token, JWT_SECRET) as JWTPayload;
        } catch (error) {
            return null;
        }
    }

    // Set auth cookie
    static setAuthCookie(res: NextApiResponse, token: string) {
        res.setHeader(
            'Set-Cookie',
            cookie.serialize('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/'
            })
        );
    }

    // Clear auth cookie
    static clearAuthCookie(res: NextApiResponse) {
        res.setHeader(
            'Set-Cookie',
            cookie.serialize('auth_token', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 0,
                path: '/'
            })
        );
    }

    // Get token from request
    static getTokenFromRequest(req: NextApiRequest): string | null {
        const cookies = cookie.parse(req.headers.cookie || '');
        return cookies.auth_token || null;
    }

    // Get user from request
    static getUserFromRequest(req: NextApiRequest): JWTPayload | null {
        const token = this.getTokenFromRequest(req);
        if (!token) return null;
        return this.verifyToken(token);
    }

    // Middleware to require authentication
    static requireAuth(handler: Function) {
        return async (req: NextApiRequest, res: NextApiResponse) => {
            const user = this.getUserFromRequest(req);

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Attach user to request
            (req as any).user = user;

            return handler(req, res);
        };
    }

    // Middleware to require admin
    static requireAdmin(handler: Function) {
        return async (req: NextApiRequest, res: NextApiResponse) => {
            const user = this.getUserFromRequest(req);

            if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
                return res.status(403).json({ error: 'Forbidden: Admin access required' });
            }

            // Attach user to request
            (req as any).user = user;

            return handler(req, res);
        };
    }

    // Middleware to require super admin
    static requireSuperAdmin(handler: Function) {
        return async (req: NextApiRequest, res: NextApiResponse) => {
            const user = this.getUserFromRequest(req);

            if (!user || user.role !== 'super_admin') {
                return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
            }

            // Attach user to request
            (req as any).user = user;

            return handler(req, res);
        };
    }

    // Validate password strength
    static validatePassword(password: string): { valid: boolean; error?: string } {
        if (password.length < 8) {
            return { valid: false, error: 'Password must be at least 8 characters long' };
        }

        if (!/[A-Z]/.test(password)) {
            return { valid: false, error: 'Password must contain at least one uppercase letter' };
        }

        if (!/[a-z]/.test(password)) {
            return { valid: false, error: 'Password must contain at least one lowercase letter' };
        }

        if (!/[0-9]/.test(password)) {
            return { valid: false, error: 'Password must contain at least one number' };
        }

        return { valid: true };
    }

    // Validate email
    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Generate random password
    static generateRandomPassword(length: number = 16): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';

        // Ensure at least one of each required character type
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }

        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}
