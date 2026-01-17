import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Competition ID is required' });
    }

    // POST - Join competition
    if (req.method === 'POST') {
        try {
            const user = Auth.getUserFromRequest(req);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const competition = await Database.getCompetitionById(id as string);
            if (!competition) {
                return res.status(404).json({ error: 'Competition not found' });
            }

            // Check if already joined
            const participants = await Database.getCompetitionParticipants(id as string);
            if (participants.some((p: any) => p.userId === user.userId)) {
                return res.status(400).json({ error: 'Already joined this competition' });
            }

            // Create join request
            const requiresApproval = competition.joinMode === 'private' || competition.joinMode === 'invite';
            const participant = await Database.addParticipant(id as string, user.userId, !requiresApproval);

            // Create notification for creator if approval required
            if (requiresApproval) {
                await Database.createNotification({
                    user_id: competition.creatorId,
                    type: 'join_request',
                    title: 'New Join Request',
                    message: `${user.email} want to join ${competition.name}`
                });
            }

            return res.status(200).json({
                success: true,
                requiresApproval,
                participant
            });
        } catch (error) {
            console.error('Join competition error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
