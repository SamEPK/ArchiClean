import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_REPOSITORY } from './repositories.module';

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
import { InMemoryUserRepository } from '../../../infrastructure/repositories/in-memory/InMemoryUserRepository';

const forceInMemory = (process.env.USE_IN_MEMORY || '').toLowerCase() === 'true' || process.env.USE_IN_MEMORY === '1';
const mongoUri = forceInMemory ? undefined : process.env.MONGODB_URI || process.env.MONGO_URI;
const mongoImports = mongoUri
  ? [
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          uri:
            configService.get<string>('MONGODB_URI') ||
            configService.get<string>('MONGO_URI') ||
            'mongodb://admin:admin123@localhost:27017/archiclean?authSource=admin',
        }),
        inject: [ConfigService],
      }),
      MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ]
  : [];

  const mongoProviders = mongoUri
    ? [
        {
          provide: 'IUserRepository',
          useClass: MongoUserRepository,
        },
        MongoUserRepository,
      ]
    : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ...mongoImports,
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
    ...mongoProviders,
    ...(mongoUri
      ? []
      : [
          {
            provide: 'IUserRepository',
            useExisting: USER_REPOSITORY,
          },
        ]),

    // Use Cases - Auth
    {
      provide: RegisterUserUseCase,
      useFactory: (
        userRepository: any,
        hashService: HashService,
        emailService: EmailService
      ) => {
        return new RegisterUserUseCase(userRepository, hashService, emailService);
      },
      inject: ['IUserRepository', HashService, EmailService],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (userRepository: any, hashService: HashService) => {
        return new LoginUserUseCase(userRepository, hashService);
      },
      inject: ['IUserRepository', HashService],
    },
    {
      provide: ConfirmUserEmailUseCase,
      useFactory: (userRepository: any, emailService: EmailService) => {
        return new ConfirmUserEmailUseCase(userRepository, emailService);
      },
      inject: ['IUserRepository', EmailService],
    },
    {
      provide: RefreshTokenUseCase,
      useFactory: (userRepository: any) => {
        return new RefreshTokenUseCase(userRepository);
      },
      inject: ['IUserRepository'],
    },
    {
      provide: LogoutUserUseCase,
      useFactory: (userRepository: any) => {
        return new LogoutUserUseCase(userRepository);
      },
      inject: ['IUserRepository'],
    },

    // Use Cases - User Profile
    {
      provide: UpdateProfileUseCase,
      useFactory: (userRepository: any) => {
        return new UpdateProfileUseCase(userRepository);
      },
      inject: ['IUserRepository'],
    },
    {
      provide: GetProfileUseCase,
      useFactory: (userRepository: any) => {
        return new GetProfileUseCase(userRepository);
      },
      inject: ['IUserRepository'],
    },
    {
      provide: UploadAvatarUseCase,
      useFactory: (
        userRepository: any,
        fileUploadService: FileUploadService
      ) => {
        return new UploadAvatarUseCase(userRepository, fileUploadService);
      },
      inject: ['IUserRepository', FileUploadService],
    },
    {
      provide: GetPublicProfilesUseCase,
      useFactory: (userRepository: any) => {
        return new GetPublicProfilesUseCase(userRepository);
      },
      inject: ['IUserRepository'],
    },
    {
      provide: SearchUsersUseCase,
      useFactory: (userRepository: any) => {
        return new SearchUsersUseCase(userRepository);
      },
      inject: ['IUserRepository'],
    },
  ],
  exports: [
    JwtModule,
    PassportModule,
    JwtStrategy,
    JwtRefreshStrategy,
    HashService,
    EmailService,
    FileUploadService,
    ...(mongoUri ? [MongoUserRepository] : []),
    JwtAuthGuard,
    LocalAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
