import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { toUserEntity, toUserDocument } from './UserModel';

/**
 * Implémentation MongoDB du repository User
 * 
 * Cette classe implémente l'interface IUserRepository définie dans le domaine.
 * Elle gère la persistance des utilisateurs dans MongoDB via Mongoose.
 * 
 * Pattern utilisés:
 * - Repository Pattern (pour l'abstraction de la persistance)
 * - Adapter Pattern (conversion entité ⇄ document)
 * - Dependency Injection (NestJS @Injectable)
 * 
 * @infrastructure Repository Implementation - Couche Infrastructure
 */
@Injectable()
export class MongoUserRepository implements IUserRepository {
  /**
   * Constructeur avec injection du modèle Mongoose
   * @param userModel - Modèle Mongoose pour la collection User
   */
  constructor(
    @InjectModel('User') private readonly userModel: Model<any>,
  ) {}

  /**
   * Crée un nouvel utilisateur dans MongoDB
   * Convertit l'entité en document Mongoose avant sauvegarde
   */
  async create(user: User): Promise<User> {
    const userDoc = toUserDocument(user);
    const created = await this.userModel.create(userDoc);
    return toUserEntity(created);
  }

  /**
   * Trouve un utilisateur par son ID MongoDB
   */
  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findById(id);
    return doc ? toUserEntity(doc) : null;
  }

  /**
   * Trouve un utilisateur par email (insensible à la casse)
   */
  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ email: email.toLowerCase() });
    return doc ? toUserEntity(doc) : null;
  }

  /**
   * Trouve un utilisateur par son token de confirmation
   */
  async findByEmailConfirmationToken(token: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ emailConfirmationToken: token });
    return doc ? toUserEntity(doc) : null;
  }

  /**
   * Trouve un utilisateur par son refresh token JWT
   */
  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ refreshToken });
    return doc ? toUserEntity(doc) : null;
  }

  /**
   * Met à jour un utilisateur existant
   * @throws {Error} Si l'utilisateur n'existe pas
   */
  async update(user: User): Promise<User> {
    const userDoc = toUserDocument(user);
    const updated = await this.userModel.findByIdAndUpdate(
      user.id,
      { $set: userDoc },
      { new: true }
    );
    
    if (!updated) {
      throw new Error(`User with id ${user.id} not found`);
    }
    
    return toUserEntity(updated);
  }

  /**
   * Supprime un utilisateur de la base de données
   */
  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }

  /**
   * Récupère tous les utilisateurs avec pagination
   * Triés par date de création (plus récents en premier)
   */
  async findAll(skip: number = 0, limit: number = 20): Promise<User[]> {
    const docs = await this.userModel.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    return docs.map(toUserEntity);
  }

  /**
   * Compte le nombre total d'utilisateurs
   */
  async count(): Promise<number> {
    return await this.userModel.countDocuments();
  }

  /**
   * Recherche des utilisateurs par nom/prénom (recherche insensible à la casse)
   * Utilise une regex MongoDB pour la recherche partielle
   */
  async searchByName(query: string, skip: number = 0, limit: number = 20): Promise<User[]> {
    const docs = await this.userModel.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
      ],
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    return docs.map(toUserEntity);
  }

  /**
   * Récupère uniquement les profils publics
   * Filtre sur isPublic = true
   */
  async findPublicProfiles(skip: number = 0, limit: number = 20): Promise<User[]> {
    const docs = await this.userModel.find({ isPublic: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    return docs.map(toUserEntity);
  }
}
