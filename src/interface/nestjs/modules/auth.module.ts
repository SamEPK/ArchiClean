import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Controllers
import { AuthController } from '../controllers/auth.controller';
import { UserController } from '../controllers/user.controller';

// Strategies
import { JwtStrategy } from '../strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../strategies/jwt-refresh.strategy';
import { LocalStrategy } from '../strategies/local.strategy';

// Guards
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

// Use Cases - Auth
import { RegisterUserUseCase } from '../../../application/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../application/use-cases/LoginUserUseCase';
import { ConfirmUserEmailUseCase } from '../../../application/use-cases/ConfirmUserEmailUseCase';
import { RefreshTokenUseCase } from '../../../application/use-cases/RefreshTokenUseCase';
import { LogoutUserUseCase } from '../../../application/use-cases/LogoutUserUseCase';

// Use Cases - User Profile
import { UpdateProfileUseCase } from '../../../application/use-cases/UpdateProfileUseCase';
import { GetProfileUseCase } from '../../../application/use-cases/GetProfileUseCase';
import { UploadAvatarUseCase } from '../../../application/use-cases/UploadAvatarUseCase';
import { GetPublicProfilesUseCase } from '../../../application/use-cases/GetPublicProfilesUseCase';
import { SearchUsersUseCase } from '../../../application/use-cases/SearchUsersUseCase';

// Services
import { HashService } from '../../../infrastructure/services/HashService';
import { EmailService } from '../../../infrastructure/services/EmailService';
import { FileUploadService } from '../../../infrastructure/services/FileUploadService';

// Repositories
import { MongoUserRepository } from '../../../infrastructure/repositories/mongodb/MongoUserRepository';
import { UserSchema } from '../../../infrastructure/repositories/mongodb/UserModel';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://admin:admin123@localhost:27017/archiclean?authSource=admin',
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
        signOptions: {
          expiresIn: '1h' as const,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [
    // Strategies
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,

    // Guards
    JwtAuthGuard,
    LocalAuthGuard,
    RolesGuard,

    // Services
    {
      provide: HashService,
      useClass: HashService,
    },
    {
      provide: EmailService,
      useFactory: (configService: ConfigService) => {
        return new EmailService(
          configService.get<string>('EMAIL_HOST'),
          parseInt(configService.get<string>('EMAIL_PORT') || '587'),
          configService.get<string>('EMAIL_USER'),
          configService.get<string>('EMAIL_PASSWORD'),
          configService.get<string>('EMAIL_FROM')
        );
      },
      inject: [ConfigService],
    },
    {
      provide: FileUploadService,
      useFactory: (configService: ConfigService) => {
        return new FileUploadService(
          configService.get<string>('UPLOAD_DIR'),
          configService.get<string>('ALLOWED_FILE_TYPES')?.split(','),
          parseInt(configService.get<string>('MAX_FILE_SIZE') || '5242880')
        );
      },
      inject: [ConfigService],
    },

    // Repositories
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
    MongoUserRepository,

    // Use Cases - Auth
    {
      provide: RegisterUserUseCase,
      useFactory: (
        userRepository: MongoUserRepository,
        hashService: HashService,
        emailService: EmailService
      ) => {
        return new RegisterUserUseCase(userRepository, hashService, emailService);
      },
      inject: [MongoUserRepository, HashService, EmailService],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (userRepository: MongoUserRepository, hashService: HashService) => {
        return new LoginUserUseCase(userRepository, hashService);
      },
      inject: [MongoUserRepository, HashService],
    },
    {
      provide: ConfirmUserEmailUseCase,
      useFactory: (userRepository: MongoUserRepository, emailService: EmailService) => {
        return new ConfirmUserEmailUseCase(userRepository, emailService);
      },
      inject: [MongoUserRepository, EmailService],
    },
    {
      provide: RefreshTokenUseCase,
      useFactory: (userRepository: MongoUserRepository) => {
        return new RefreshTokenUseCase(userRepository);
      },
      inject: [MongoUserRepository],
    },
    {
      provide: LogoutUserUseCase,
      useFactory: (userRepository: MongoUserRepository) => {
        return new LogoutUserUseCase(userRepository);
      },
      inject: [MongoUserRepository],
    },

    // Use Cases - User Profile
    {
      provide: UpdateProfileUseCase,
      useFactory: (userRepository: MongoUserRepository) => {
        return new UpdateProfileUseCase(userRepository);
      },
      inject: [MongoUserRepository],
    },
    {
      provide: GetProfileUseCase,
      useFactory: (userRepository: MongoUserRepository) => {
        return new GetProfileUseCase(userRepository);
      },
      inject: [MongoUserRepository],
    },
    {
      provide: UploadAvatarUseCase,
      useFactory: (
        userRepository: MongoUserRepository,
        fileUploadService: FileUploadService
      ) => {
        return new UploadAvatarUseCase(userRepository, fileUploadService);
      },
      inject: [MongoUserRepository, FileUploadService],
    },
    {
      provide: GetPublicProfilesUseCase,
      useFactory: (userRepository: MongoUserRepository) => {
        return new GetPublicProfilesUseCase(userRepository);
      },
      inject: [MongoUserRepository],
    },
    {
      provide: SearchUsersUseCase,
      useFactory: (userRepository: MongoUserRepository) => {
        return new SearchUsersUseCase(userRepository);
      },
      inject: [MongoUserRepository],
    },
  ],
  exports: [
    JwtModule,
    HashService,
    EmailService,
    FileUploadService,
    MongoUserRepository,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
