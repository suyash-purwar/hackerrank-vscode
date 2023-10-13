export default interface TrackChallenges {
  maxScore: number;
  submissions: number;
  accepted: number;
  successRatio: number;
  id: number;
  slug: string;
  name: string;
  description: string;
  difficulty: string;
  hints: string[];
  tagNames: string[];
  skill: string;
}
