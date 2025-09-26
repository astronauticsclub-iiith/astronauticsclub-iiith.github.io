export interface User {
  _id?: string;
  id?: string;
  name?: string;
  email: string;
  avatar?: string;
  bio?: string;
  linkedin?: string;
  designations?: string[];
  role: 'admin' | 'writer' | 'none';
  createdAt?: string;
}

export interface Star {
  ra: number;
  dec: number;
  magnitude: number;
  name?: string;
  avatar?: string;
  email?: string;
  linkedin?: string;
  designations?: string[];
  desc?: string;
  clickable: boolean;
};

export interface Constellation {
  stars: { [key: string]: Star };
  lines: [string, string][];
  team: string;
}

export interface Constellations {
  [key: string]: Constellation;
}