import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { FileUploadService, UploadedFile } from '../../infrastructure/services/FileUploadService';

export interface UploadAvatarDTO {
  userId: string;
  file: Express.Multer.File;
}

export interface UploadAvatarResult {
  user: User;
  uploadedFile: UploadedFile;
  message: string;
}

export class UploadAvatarUseCase {
  constructor(
    private userRepository: IUserRepository,
    private fileUploadService: FileUploadService
  ) {}

  async execute(dto: UploadAvatarDTO): Promise<UploadAvatarResult> {
    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Upload l'avatar
    const uploadedFile = await this.fileUploadService.uploadAvatar(dto.file, dto.userId);

    // Mettre à jour l'avatar dans le profil
    user.updateAvatar(uploadedFile.url);
    const updatedUser = await this.userRepository.update(user);

    return {
      user: updatedUser,
      uploadedFile,
      message: 'Avatar mis à jour avec succès',
    };
  }
}
