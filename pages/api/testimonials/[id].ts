import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

export default Auth.requireAdmin(async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;
    const user = (req as any).user;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid testimonial ID' });
    }

    // PUT - Update testimonial (approve/hide)
    if (req.method === 'PUT') {
        try {
            const { action } = req.body;

            if (action === 'approve') {
                const testimonial = await Database.updateTestimonial(id, {
                    status: 'approved',
                    approved_at: new Date().toISOString(),
                    approved_by: user.userId
                });
                return res.status(200).json({ success: true, testimonial });
            }

            if (action === 'hide') {
                const testimonial = await Database.updateTestimonial(id, {
                    status: 'hidden',
                    hidden_at: new Date().toISOString(),
                    hidden_by: user.userId
                });
                return res.status(200).json({ success: true, testimonial });
            }

            return res.status(400).json({ error: 'Invalid action' });
        } catch (error) {
            console.error('Update testimonial error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // DELETE - Delete testimonial
    if (req.method === 'DELETE') {
        try {
            await Database.deleteTestimonial(id);
            return res.status(200).json({ success: true, message: 'Testimonial deleted' });
        } catch (error) {
            console.error('Delete testimonial error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
});
