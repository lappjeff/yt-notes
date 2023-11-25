export enum MessageType {
  REQUEST_VIDEO_METADATA = "request_video_metadata",
  SYNC_DATA = "sync_data",
}

export type MessageOption = `${MessageType}`;

export interface Message {
  type: MessageOption;
  payload?: { [key: string]: any };
}

export interface VideoPayload {
  timestamp: string;
  videoId: string;
  url: string;
}
