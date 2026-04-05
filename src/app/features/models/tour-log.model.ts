export interface TourLog {
  id?: number;
  dateTime: string;
  comment?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  totalDistance?: number;
  totalTime?: number;
  rating?: number;
  tourId: number;
}
