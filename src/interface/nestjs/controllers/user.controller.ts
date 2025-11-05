import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { UpdateProfileDto, SearchUsersDto } from '../dto/user.dto';
import { UpdateProfileUseCase } from '../../../application/use-cases/UpdateProfileUseCase';
import { GetProfileUseCase } from '../../../application/use-cases/GetProfileUseCase';
import { UploadAvatarUseCase } from '../../../application/use-cases/UploadAvatarUseCase';
import { GetPublicProfilesUseCase } from '../../../application/use-cases/GetPublicProfilesUseCase';
import { SearchUsersUseCase } from '../../../application/use-cases/SearchUsersUseCase';
import { UserRole } from '../../../domain/entities/User';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private updateProfileUseCase: UpdateProfileUseCase,
    private getProfileUseCase: GetProfileUseCase,
    private uploadAvatarUseCase: UploadAvatarUseCase,
    private getPublicProfilesUseCase: GetPublicProfilesUseCase,
    private searchUsersUseCase: SearchUsersUseCase
  ) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@CurrentUser() user: any) {
    const result = await this.getProfileUseCase.execute({
      userId: user.userId,
      requestingUserId: user.userId,
    });

    return {
      message: result.message,
      user: result.user,
    };
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    const result = await this.updateProfileUseCase.execute({
      userId: user.userId,
      ...dto,
    });

    return {
      message: result.message,
      user: result.user,
    };
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    const result = await this.uploadAvatarUseCase.execute({
      userId: user.userId,
      file,
    });

    return {
      message: result.message,
      avatar: result.uploadedFile,
      user: {
        id: result.user.id,
        avatar: result.user.avatar,
      },
    };
  }

  @Get('public')
  @HttpCode(HttpStatus.OK)
  async getPublicProfiles(
    @Query('skip') skip?: number,
    @Query('limit') limit?: number
  ) {
    const result = await this.getPublicProfilesUseCase.execute({
      skip: skip ? parseInt(skip.toString()) : 0,
      limit: limit ? parseInt(limit.toString()) : 20,
    });

    return {
      message: result.message,
      profiles: result.profiles,
      total: result.total,
    };
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchUsers(
    @Query() dto: SearchUsersDto,
    @Query('skip') skip?: number,
    @Query('limit') limit?: number
  ) {
    const result = await this.searchUsersUseCase.execute({
      query: dto.query,
      skip: skip ? parseInt(skip.toString()) : 0,
      limit: limit ? parseInt(limit.toString()) : 20,
    });

    return {
      message: result.message,
      users: result.users,
      total: result.total,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserProfile(@CurrentUser() user: any, @Param('id') userId: string) {
    const result = await this.getProfileUseCase.execute({
      userId,
      requestingUserId: user.userId,
    });

    return {
      message: result.message,
      user: result.user,
    };
  }

  // Routes admin uniquement
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    // TODO: Implémenter GetAllUsersUseCase si nécessaire
    return {
      message: 'Liste des utilisateurs (admin)',
    };
  }
}
