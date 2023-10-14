export default interface IChallenge {
  id: number;
  slug: string;
  name: string;
  languages: string[];
  totalCount: number;
  solvedCount: number;
  successRatio: number;
  maxScore: number;
  userScore: number;
  difficulty: string;
  description: string;
  questionHtml: string;
  authorName: string;
  authorAvatar: string;
}