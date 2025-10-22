/**
 * Storage Adapter Interface
 * Contract for file storage operations (S3, local, etc.)
 */
export type IStorageAdapter = {
  /**
   * Upload a file
   */
  upload(
    file: Buffer | Blob,
    filename: string,
    mimeType: string
  ): Promise<{
    key: string;
    url: string;
  }>;

  /**
   * Get file URL
   */
  getUrl(key: string): Promise<string>;

  /**
   * Delete a file
   */
  delete(key: string): Promise<void>;

  /**
   * Check if file exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get file metadata
   */
  getMetadata(key: string): Promise<{
    size: number;
    mimeType: string;
    lastModified: Date;
  }>;
};
