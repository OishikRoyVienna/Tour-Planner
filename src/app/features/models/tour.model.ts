export interface Tour {
  id?: number;
  name: string;
  description?: string;
  fromLocation: string;
  toLocation: string;
  transportType: 'BIKE' | 'HIKE' | 'RUNNING' | 'VACATION' | 'CAR';
  distance?: number;
  estimatedTime?: number;
  routeInformation?: string;
  imagePath?: string;
  userId: number;
  popularity?: number;
  childFriendly?: boolean;
}
