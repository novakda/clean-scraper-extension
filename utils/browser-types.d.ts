// Firefox-specific StreamFilter API type declarations
declare namespace browser.webRequest {
  interface StreamFilter {
    ondata: ((event: { data: ArrayBuffer }) => void) | null;
    onstop: (() => void) | null;
    onerror: ((error: any) => void) | null;
    onstart: (() => void) | null;
    write(data: ArrayBuffer | Uint8Array): void;
    disconnect(): void;
    close(): void;
    suspend(): void;
    resume(): void;
    readonly status: string;
    readonly error: string;
  }

  function filterResponseData(requestId: string): StreamFilter;
}
