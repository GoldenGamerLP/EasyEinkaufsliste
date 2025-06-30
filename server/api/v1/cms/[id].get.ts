import { getFileStream, getFileInfo } from '~/server/utils/FileUtils';
import { ObjectId } from 'mongodb';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    if (!id || !ObjectId.isValid(id)) {
      throw createError({
        status: 400,
        message: 'Invalid file ID'
      });
    }

    const fileId = new ObjectId(id);
    
    // Get file info to set correct headers
    const fileInfo = await getFileInfo(fileId);
    if (!fileInfo) {
      throw createError({
        status: 404,
        message: 'File not found'
      });
    }

    // Set appropriate Content-Type header
    handleCacheHeaders(event, {maxAge: 1 * 60 * 60, cacheControls: ['public']});
    setResponseHeader(event, 'Content-Type', fileInfo.contentType || 'application/octet-stream');
    setResponseHeader(event, 'Content-Disposition', `inline; filename="${fileInfo.filename}"`);

    // Return the file stream
    return sendStream(event, getFileStream(fileId));
  } catch (error: any) {
    if (error.statusCode === 404 || error.message.includes('not found')) {
      throw createError({
        status: 404,
        message: 'File not found'
      });
    }
    
    console.error('Error retrieving file:', error);
    throw createError({
      status: 500,
      message: 'Failed to retrieve file'
    });
  }
});
