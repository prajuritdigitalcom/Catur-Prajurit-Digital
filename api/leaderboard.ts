import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const topPlayers = [
    { rank: 1, id: 'gm-1', username: 'PrajuritGrandmaster', displayName: 'Kapten Catur ID', avatar: '👑', rating: 2450, wins: 182, losses: 14, draws: 22, winRate: 83, isOnline: true },
    { rank: 2, id: 'gm-2', username: 'Rani_ChessPro', displayName: 'Rani WFM', avatar: '🐉', rating: 2210, wins: 140, losses: 30, draws: 18, winRate: 74, isOnline: true },
    { rank: 3, id: 'gm-3', username: 'Dimas_Tactics', displayName: 'Dimas Taktis', avatar: '⚔️', rating: 1980, wins: 95, losses: 25, draws: 10, winRate: 73, isOnline: false },
    { rank: 4, id: 'gm-4', username: 'Bima_Master', displayName: 'Bima Setya', avatar: '🦁', rating: 1840, wins: 88, losses: 40, draws: 12, winRate: 63, isOnline: true },
    { rank: 5, id: 'gm-5', username: 'Siti_Queen', displayName: 'Siti Chess Queen', avatar: '⚡', rating: 1720, wins: 76, losses: 38, draws: 9, winRate: 61, isOnline: false }
  ];

  res.status(200).json({ success: true, leaderboard: topPlayers });
}
