export default interface ITrackChallenges {
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
