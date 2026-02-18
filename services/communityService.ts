
import { db } from "./firebase";
import { MeetingRequest, ForumThread, Syndicate } from "../types";

export interface DirectorProfile {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  location: string;
  bio: string;
  rating: number;
  lastWork: string;
}

export const createSyndicateFromProject = async (userId: string, userName: string, project: { id: string, title: string, fundingGoal: number }) => {
  const syndicateId = `syn-${project.id}`;
  const newSyndicate: Syndicate = {
    id: syndicateId,
    name: `${project.title} Syndicate`,
    target: project.fundingGoal,
    current: 0,
    members: 1,
    minEntry: 100000,
    project: project.title,
    projectId: project.id,
    creatorId: userId,
    creatorName: userName,
    status: 'ACTIVE',
    createTime: { seconds: Date.now() / 1000 }
  };

  db.saveToCollection('syndicates', newSyndicate);
  return syndicateId;
};

export const getSyndicates = (callback: (syndicates: Syndicate[]) => void) => {
  const sync = () => callback(db.getCollection('syndicates'));
  sync();
  window.addEventListener('storage', sync);
  return () => window.removeEventListener('storage', sync);
};

export const getThreads = (callback: (threads: ForumThread[]) => void) => {
  const sync = () => callback(db.getCollection('forum'));
  sync();
  window.addEventListener('storage', sync);
  return () => window.removeEventListener('storage', sync);
};

export const getDirectors = (callback: (directors: DirectorProfile[]) => void) => {
  const sync = () => callback(db.getCollection('directors'));
  sync();
  window.addEventListener('storage', sync);
  return () => window.removeEventListener('storage', sync);
};

export const scheduleMeeting = async (meeting: Omit<MeetingRequest, 'id' | 'status' | 'createdAt'>) => {
  const id = `meet-${Date.now()}`;
  db.saveToCollection('meetings', { ...meeting, id, status: 'PENDING', createdAt: { seconds: Date.now() / 1000 } });
  return true;
};
