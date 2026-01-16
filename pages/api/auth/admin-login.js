const { Database } = require('@/lib/database');
const { Auth } = require('@/lib/auth');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find admin
        const admin = Database.getAdminByEmail(email);
        if (!admin) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await Auth.verifyPassword(password, admin.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if password reset is required
        if (admin.must_reset_password) {
            return res.status(403).json({
                error: 'Password reset required',
                requiresPasswordReset: true,
                adminId: admin.id
            });
        }

        // Generate JWT token
        const token = Auth.generateToken({
            userId: admin.id,
            email: admin.email,
            role: admin.role
        });

        // Set auth cookie
        Auth.setAuthCookie(res, token);

        // Return admin data (without password hash)
        const { password_hash, ...adminData } = admin;

        return res.status(200).json({
            success: true,
            user: adminData,
            token
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
