import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database';
import { Auth } from '@/lib/auth';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // GET - List competitions
    if (req.method === 'GET') {
        try {
            const user = Auth.getUserFromRequest(req);
            const { filter } = req.query;

            // Admins can see all competitions
            if (user && (user.role === 'admin' || user.role === 'super_admin')) {
                const competitions = await Database.getAllCompetitions();
                return res.status(200).json({ success: true, competitions });
            }

            // Public users see only public competitions
            if (filter === 'public') {
                const competitions = await Database.getPublicCompetitions();
                return res.status(200).json({ success: true, competitions });
            }

            const competitions = await Database.getAllCompetitions();
            return res.status(200).json({ success: true, competitions });
        } catch (error) {
            console.error('Get competitions error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST - Create competition (authenticated users only)
    if (req.method === 'POST') {
        try {
            const user = Auth.getUserFromRequest(req);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const {
                name,
                description,
                isPublic,
                joinMode,
                maxParticipants,
                startDate,
                duration,
                measurementMethod,
                prizeDescription,
                winnerDistribution
            } = req.body;

            // Validate required fields
            if (!name || !startDate || !duration || !measurementMethod) {
                return res.status(400).json({
                    error: 'Name, start date, duration, and measurement method are required'
                });
            }

            const competition = await Database.createCompetition({
                name,
                description,
                creatorId: user.userId,
                isPublic: isPublic !== false,
                joinMode: joinMode || 'free',
                maxParticipants: maxParticipants || null,
                startDate,
                duration,
                measurementMethod,
                prizeDescription: prizeDescription || null,
                winnerDistribution: winnerDistribution || '1st'
            });

            // Automatically add creator as participant
            await Database.addParticipant(competition.id, user.userId, true);

            return res.status(201).json({ success: true, competition });
        } catch (error) {
            console.error('Create competition error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
