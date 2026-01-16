const { Database } = require('@/lib/database');
const { Auth } = require('@/lib/auth');

export default async function handler(req, res) {
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
        const existingUser = Database.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }

        // Hash password
        const passwordHash = await Auth.hashPassword(password);

        // Calculate BMI if weight and height provided
        let bmi = null;
        if (weight && height) {
            bmi = (weight / ((height / 100) ** 2)).toFixed(1);
        }

        // Create user
        const user = Database.createUser({
            email,
            password_hash: passwordHash,
            role: 'user',
            real_name: realName,
            display_name: displayName,
            weight: weight || null,
            height: height || null,
            bmi,
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
