/**
 * Firebase Storage Service
 * 
 * Handles file uploads, downloads, and storage management
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata
} from 'firebase/storage';
import { storage } from './config';

/**
 * Firebase Storage Service Class
 */
export class FirebaseStorageService {
  
  // Storage paths
  static PATHS = {
    PRODUCTS: 'products',
    STORES: 'stores',
    USERS: 'users',
    TEMP: 'temp'
  };
  
  /**
   * Upload file to Firebase Storage
   * @param {File} file - File to upload
   * @param {string} path - Storage path
   * @param {string} fileName - Optional custom filename
   * @param {function} onProgress - Progress callback
   * @returns {Promise<object>} Upload result with download URL
   */
  static async uploadFile(file, path, fileName = null, onProgress = null) {
    try {
      if (!file) {
        return {
          success: false,
          error: 'No file provided'
        };
      }
      
      // Generate filename if not provided
      const finalFileName = fileName || `${Date.now()}_${file.name}`;
      const filePath = `${path}/${finalFileName}`;
      
      // Create storage reference
      const storageRef = ref(storage, filePath);
      
      let uploadTask;
      
      if (onProgress) {
        // Use resumable upload with progress tracking
        uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress, snapshot);
            },
            (error) => {
              reject({
                success: false,
                error: error.message
              });
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({
                  success: true,
                  url: downloadURL,
                  path: filePath,
                  fileName: finalFileName,
                  size: uploadTask.snapshot.totalBytes
                });
              } catch (error) {
                reject({
                  success: false,
                  error: error.message
                });
              }
            }
          );
        });
      } else {
        // Simple upload without progress tracking
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
          success: true,
          url: downloadURL,
          path: filePath,
          fileName: finalFileName,
          size: snapshot.totalBytes
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Upload multiple files
   * @param {FileList|Array} files - Files to upload
   * @param {string} path - Storage path
   * @param {function} onProgress - Progress callback
   * @returns {Promise<object>} Upload results
   */
  static async uploadMultipleFiles(files, path, onProgress = null) {
    try {
      const uploadPromises = Array.from(files).map((file, index) => {
        const progressCallback = onProgress 
          ? (progress, snapshot) => onProgress(index, progress, snapshot)
          : null;
        
        return this.uploadFile(file, path, null, progressCallback);
      });
      
      const results = await Promise.allSettled(uploadPromises);
      
      const successfulUploads = [];
      const failedUploads = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successfulUploads.push({
            index,
            ...result.value
          });
        } else {
          failedUploads.push({
            index,
            error: result.reason?.error || result.value?.error || 'Upload failed'
          });
        }
      });
      
      return {
        success: failedUploads.length === 0,
        successfulUploads,
        failedUploads,
        totalFiles: files.length,
        successCount: successfulUploads.length,
        failureCount: failedUploads.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Delete file from Firebase Storage
   * @param {string} filePath - Full path to file in storage
   * @returns {Promise<object>} Deletion result
   */
  static async deleteFile(filePath) {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      
      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Delete multiple files
   * @param {Array} filePaths - Array of file paths
   * @returns {Promise<object>} Deletion results
   */
  static async deleteMultipleFiles(filePaths) {
    try {
      const deletePromises = filePaths.map(path => this.deleteFile(path));
      const results = await Promise.allSettled(deletePromises);
      
      const successfulDeletions = [];
      const failedDeletions = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successfulDeletions.push(filePaths[index]);
        } else {
          failedDeletions.push({
            path: filePaths[index],
            error: result.reason?.error || result.value?.error || 'Deletion failed'
          });
        }
      });
      
      return {
        success: failedDeletions.length === 0,
        successfulDeletions,
        failedDeletions,
        totalFiles: filePaths.length,
        successCount: successfulDeletions.length,
        failureCount: failedDeletions.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get download URL for a file
   * @param {string} filePath - Full path to file in storage
   * @returns {Promise<object>} Download URL result
   */
  static async getDownloadURL(filePath) {
    try {
      const fileRef = ref(storage, filePath);
      const url = await getDownloadURL(fileRef);
      
      return {
        success: true,
        url
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get file metadata
   * @param {string} filePath - Full path to file in storage
   * @returns {Promise<object>} File metadata
   */
  static async getFileMetadata(filePath) {
    try {
      const fileRef = ref(storage, filePath);
      const metadata = await getMetadata(fileRef);
      
      return {
        success: true,
        metadata: {
          name: metadata.name,
          size: metadata.size,
          contentType: metadata.contentType,
          timeCreated: metadata.timeCreated,
          updated: metadata.updated,
          downloadTokens: metadata.downloadTokens
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * List all files in a directory
   * @param {string} folderPath - Path to folder
   * @returns {Promise<object>} List of files
   */
  static async listFiles(folderPath) {
    try {
      const folderRef = ref(storage, folderPath);
      const result = await listAll(folderRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            url,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated
          };
        })
      );
      
      const folders = result.prefixes.map(folderRef => ({
        name: folderRef.name,
        fullPath: folderRef.fullPath
      }));
      
      return {
        success: true,
        files,
        folders
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Upload product image
   * @param {File} file - Image file
   * @param {string} productId - Product ID
   * @param {function} onProgress - Progress callback
   * @returns {Promise<object>} Upload result
   */
  static async uploadProductImage(file, productId, onProgress = null) {
    const path = `${this.PATHS.PRODUCTS}/${productId}`;
    return this.uploadFile(file, path, null, onProgress);
  }
  
  /**
   * Upload store logo
   * @param {File} file - Logo file
   * @param {string} storeId - Store ID
   * @param {function} onProgress - Progress callback
   * @returns {Promise<object>} Upload result
   */
  static async uploadStoreLogo(file, storeId, onProgress = null) {
    const path = `${this.PATHS.STORES}/${storeId}`;
    const fileName = `logo_${Date.now()}.${file.name.split('.').pop()}`;
    return this.uploadFile(file, path, fileName, onProgress);
  }
  
  /**
   * Upload user avatar
   * @param {File} file - Avatar file
   * @param {string} userId - User ID
   * @param {function} onProgress - Progress callback
   * @returns {Promise<object>} Upload result
   */
  static async uploadUserAvatar(file, userId, onProgress = null) {
    const path = `${this.PATHS.USERS}/${userId}`;
    const fileName = `avatar_${Date.now()}.${file.name.split('.').pop()}`;
    return this.uploadFile(file, path, fileName, onProgress);
  }
  
  /**
   * Clean up temporary files (older than specified time)
   * @param {number} olderThanHours - Clean files older than this many hours
   * @returns {Promise<object>} Cleanup result
   */
  static async cleanupTempFiles(olderThanHours = 24) {
    try {
      const result = await this.listFiles(this.PATHS.TEMP);
      
      if (!result.success) {
        return result;
      }
      
      const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
      const filesToDelete = result.files
        .filter(file => new Date(file.timeCreated) < cutoffTime)
        .map(file => file.fullPath);
      
      if (filesToDelete.length === 0) {
        return {
          success: true,
          message: 'No files to clean up',
          deletedCount: 0
        };
      }
      
      const deleteResult = await this.deleteMultipleFiles(filesToDelete);
      
      return {
        success: deleteResult.success,
        message: `Cleaned up ${deleteResult.successCount} temporary files`,
        deletedCount: deleteResult.successCount,
        failedCount: deleteResult.failureCount
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}