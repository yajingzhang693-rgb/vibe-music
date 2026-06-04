export interface ITunesResult {
  wrapperType?: string;
  collectionType?: string;
  kind?: string;
  artistId?: number;
  collectionId?: number;
  trackId?: number;
  artistName?: string;
  collectionName?: string;
  trackName?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  releaseDate?: string;
  artworkUrl100?: string;
  artworkUrl60?: string;
  trackCount?: number;
  primaryGenreName?: string;
}

export interface ITunesResponse {
  resultCount: number;
  results: ITunesResult[];
}

export interface StoredRating {
  overall: number;
  production: number;
  songwriting: number;
  review: string;
}

export interface AlbumDisplay {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl: string;
  releaseYear?: string;
}

export type ListCapacity = 10 | 20 | 30;

export interface UserList {
  id: string;
  title: string;
  albumIds: string[];
  capacity: ListCapacity;
  createdAt: number;
}
