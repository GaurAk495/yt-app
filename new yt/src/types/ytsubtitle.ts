export type Response = {
  success: boolean;
  message?: string;
  data?: JobResponse;
};

export interface JobResponse {
  videoId: string;
  videoInfo: VideoInfo;
  language_code: LanguageCode[];
  transcripts: Transcripts;
}

export interface LanguageCode {
  code: string;
  name: string;
}

export interface Transcripts {
  en_auto: EnAuto;
}

export interface EnAuto {
  custom: Auto[];
  default: Auto[];
  auto: Auto[];
}

export interface Auto {
  start: string;
  end: string;
  text: string;
}

export interface VideoInfo {
  name: string;
  thumbnailUrl: ThumbnailURL;
  embedUrl: string;
  duration: string;
  description: string;
  upload_date: string;
  genre: string;
  author: string;
  channel_id: string;
}

export interface ThumbnailURL {
  hqdefault: string;
  maxresdefault: string;
}
