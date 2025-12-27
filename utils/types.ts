import { LogLevel } from './logger';

// Traffic record types
export interface TrafficRequestData {
  id?: number;
  type: 'request';
  url: string;
  method: string;
  headers?: chrome.webRequest.HttpHeader[];
  postData?: chrome.webRequest.UploadData[] | null;
  timestamp: number;
  requestId: string;
  tabId: number;
}

export interface TrafficResponseData {
  id?: number;
  type: 'response';
  url: string;
  status: number;
  statusText: string;
  headers?: chrome.webRequest.HttpHeader[];
  mimeType: string;
  body: string | null;
  timestamp: number;
  requestId: string;
  tabId: number;
}

export type TrafficData = TrafficRequestData | TrafficResponseData;

// Configuration types
export interface CaptureConfig {
  urlPatterns: string[];
  enabled: boolean;
  advanced?: {
    allowedStatusCodes: number[];
    requireContentType: boolean;
    captureRedirects: boolean;
    captureErrors: boolean;
    minBodySize: number;
    maxBodySize: number;
  };
  debug?: {
    logLevel: LogLevel;
    logFilteredRequests: boolean;
  };
}

// Runtime message types
export interface GetConfigMessage {
  action: 'getConfig';
}

export interface SaveConfigMessage {
  action: 'saveConfig';
  config: CaptureConfig;
}

export interface GetAllTrafficMessage {
  action: 'getAllTraffic';
}

export interface ClearTrafficMessage {
  action: 'clearTraffic';
}

export interface ToggleCaptureMessage {
  action: 'toggleCapture';
}

export interface GetCaptureStatsMessage {
  action: 'getCaptureStats';
}

export interface CaptureStats {
  totalCaptured: number;
  totalFiltered: number;
  lastCapturedUrl: string | null;
  lastFilteredUrl: string | null;
  lastFilterReason: string | null;
  isCapturing: boolean;
}

export type RuntimeMessage =
  | GetConfigMessage
  | SaveConfigMessage
  | GetAllTrafficMessage
  | ClearTrafficMessage
  | ToggleCaptureMessage
  | GetCaptureStatsMessage;

// Response types
export interface SuccessResponse {
  success: true;
}

export type MessageResponse = CaptureConfig | TrafficData[] | SuccessResponse | CaptureStats;

// IndexedDB types
export interface DBSchema {
  traffic: TrafficData;
}

export interface PendingRequest {
  type: 'request';
  url: string;
  method: string;
  postData: chrome.webRequest.UploadData[] | null | undefined;
  timestamp: number;
  requestId: string;
  tabId: number;
}
