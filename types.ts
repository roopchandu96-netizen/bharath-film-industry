
export enum UserRole {
  INVESTOR = 'INVESTOR',
  DIRECTOR = 'DIRECTOR',
  ADMIN = 'ADMIN'
}

export enum ProducerTier {
  SUPPORTER = 'Supporter Producer',
  ASSOCIATE = 'Associate Producer',
  CO_PRODUCER = 'Co-Producer',
  EXECUTIVE = 'Executive Producer'
}

export interface MovieProject {
  id: string;
  title: string;
  tagline: string;
  genre: string;
  posterUrl: string;
  teaserUrl: string;
  description: string; // Used for Synopsis
  budget: number;
  fundingGoal: number;
  currentFunding: number;
  investorCount: number;
  director: string;
  directorId: string;
  status: 'PENDING' | 'ACTIVE' | 'FUNDED' | 'PRODUCTION' | 'RELEASED';
  successProbability?: number;
  aiAnalysis?: string;
  clientTime?: number;
  createdAt?: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  totalInvested: number;
  projects: string[];
  photoURL?: string;
  photoFileName?: string;
}

export interface Investment {
  id: string;
  userId: string;
  projectId: string;
  amount: number;
  date: string;
  tier: ProducerTier;
}

export interface AIProbabilityResult {
  score: number;
  rationale: string;
  marketOutlook: string;
  risks: string[];
}

/**
 * BFI Registry: Community Syndicate Node
 */
export interface Syndicate {
  id: string;
  name: string;
  target: number;
  current: number;
  members: number;
  minEntry: number;
  project: string;
  projectId: string;
  creatorId: string;
  creatorName: string;
  status: 'ACTIVE' | 'CLOSED';
  createTime: any;
}

/**
 * BFI Registry: Forum Discussion Thread
 */
export interface ForumThread {
  id: string;
  title: string;
  author: string;
  replies: number;
  category: string;
  lastUpdate: any;
}

/**
 * BFI Registry: Vault File Record
 */
export interface FileRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  path: string;
  uploadDate: string;
  notes: string;
  aiSummary: string;
  actionType: 'UPLOAD' | 'GENERATE';
  user_id?: string;
}

/**
 * BFI Registry: Smart Legal Agreement
 */
export interface SmartAgreement {
  id: string;
  content: string;
  projectId?: string;
  investorId?: string;
  status: 'DRAFT' | 'SIGNED';
}

/**
 * BFI Registry: Institutional Meeting Request
 */
export interface MeetingRequest {
  id: string;
  title: string;
  date: string;
  time: string;
  directorId: string;
  investorId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: any;
}

/**
 * BFI Registry: Peer-to-Peer Message Node
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  seen: boolean;
  aiGenerated: boolean;
}

/**
 * BFI Registry: Peer-to-Peer Conversation Node
 */
export interface Conversation {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  lastMessage: string;
  lastUpdated: any;
  typing: { [key: string]: boolean };
}
