import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // GET - List all testimonials (admin only) or approved testimonials (public)
    if (req.method === 'GET') {
        try {
            const user = Auth.getUserFromRequest(req);

            // If admin, return all testimonials
            if (user && (user.role === 'admin' || user.role === 'super_admin')) {
                const testimonials = await Database.getAllTestimonials();
                return res.status(200).json({ success: true, testimonials });
            }

            // Otherwise, return only approved testimonials
            const testimonials = await Database.getApprovedTestimonials();
            return res.status(200).json({ success: true, testimonials });
        } catch (error) {
            console.error('Get testimonials error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST - Create testimonial (authenticated users only)
    if (req.method === 'POST') {
        try {
            const user = Auth.getUserFromRequest(req);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { competitionId, text, weightLost } = req.body;

            if (!competitionId || !text) {
                return res.status(400).json({ error: 'Competition ID and text are required' });
            }

            const testimonial = await Database.createTestimonial({
                userId: user.userId,
                competitionId,
                text,
                weightLost: weightLost || null
            });

            return res.status(201).json({ success: true, testimonial });
        } catch (error) {
            console.error('Create testimonial error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
