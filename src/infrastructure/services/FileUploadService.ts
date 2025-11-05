import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
}

export class FileUploadService {
  private uploadDir: string;
  private allowedMimeTypes: string[];
  private maxFileSize: number;

  constructor(
    uploadDir: string = process.env.UPLOAD_DIR || './uploads',
    allowedMimeTypes: string[] = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
    maxFileSize: number = parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB par défaut
  ) {
    this.uploadDir = uploadDir;
    this.allowedMimeTypes = allowedMimeTypes;
    this.maxFileSize = maxFileSize;

    // Créer le dossier d'upload s'il n'existe pas
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    const avatarsDir = path.join(this.uploadDir, 'avatars');
    
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }
  }

  /**
   * Valide un fichier uploadé
   */
  validateFile(file: Express.Multer.File): void {
    // Vérifier le type MIME
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(
        `Type de fichier non autorisé. Types autorisés: ${this.allowedMimeTypes.join(', ')}`
      );
    }

    // Vérifier la taille
    if (file.size > this.maxFileSize) {
      throw new Error(
        `Fichier trop volumineux. Taille maximale: ${this.maxFileSize / 1024 / 1024}MB`
      );
    }
  }

  /**
   * Upload un avatar utilisateur
   */
  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<UploadedFile> {
    this.validateFile(file);

    const fileExtension = path.extname(file.originalname);
    const filename = `${userId}-${uuidv4()}${fileExtension}`;
    const avatarPath = path.join('avatars', filename);
    const fullPath = path.join(this.uploadDir, avatarPath);

    // Supprimer l'ancien avatar si existe
    await this.deleteOldAvatar(userId);

    // Sauvegarder le nouveau fichier
    fs.writeFileSync(fullPath, file.buffer);

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    
    return {
      filename,
      originalName: file.originalname,
      path: avatarPath,
      url: `${appUrl}/uploads/${avatarPath}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Supprime l'ancien avatar d'un utilisateur
   */
  private async deleteOldAvatar(userId: string): Promise<void> {
    const avatarsDir = path.join(this.uploadDir, 'avatars');
    
    if (!fs.existsSync(avatarsDir)) {
      return;
    }

    const files = fs.readdirSync(avatarsDir);
    const userFiles = files.filter(file => file.startsWith(`${userId}-`));

    for (const file of userFiles) {
      const filePath = path.join(avatarsDir, file);
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Error deleting old avatar: ${error}`);
      }
    }
  }

  /**
   * Supprime un fichier
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  /**
   * Obtient l'URL publique d'un fichier
   */
  getFileUrl(filePath: string): string {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${appUrl}/uploads/${filePath}`;
  }
}
