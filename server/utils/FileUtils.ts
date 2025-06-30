import { Readable } from 'stream';
import { getGridFSBucket } from './DBUtils';
import { ObjectId } from 'mongodb';

export interface UploadedFile {
  id: ObjectId;
  filename: string;
  contentType: string;
  length: number;
}

/**
 * Upload a file to GridFS
 */
export async function uploadFile(
  buffer: Buffer, 
  filename: string, 
  contentType: string
): Promise<UploadedFile> {
  const bucket = getGridFSBucket();
  
  return new Promise((resolve, reject) => {
    // Create a readable stream from the buffer
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null); // Signals end of stream

    // Create an upload stream to GridFS
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: {
        uploadDate: new Date()
      }
    });

    // Handle stream completion
    uploadStream.on('finish', () => {
      resolve({
        id: uploadStream.id,
        filename,
        contentType,
        length: uploadStream.length
      });
    });
    
    // Handle stream error
    uploadStream.on('error', (error) => {
      reject(error);
    });

    // Start the upload by piping the readable stream to the upload stream
    readableStream.pipe(uploadStream);
  });
}

/**
 * Get a file stream from GridFS by its ID
 */
export function getFileStream(fileId: ObjectId) {
  const bucket = getGridFSBucket();
  return bucket.openDownloadStream(fileId);
}

/**
 * Delete a file from GridFS
 */
export async function deleteFile(fileId: ObjectId) {
  const bucket = getGridFSBucket();
  return bucket.delete(fileId);
}

/**
 * Get file info from GridFS
 */
export async function getFileInfo(fileId: ObjectId) {
  const bucket = getGridFSBucket();
  // Find all files with the given _id
  const files = await bucket.find({ _id: fileId }).toArray();
  return files[0] || null;
}
