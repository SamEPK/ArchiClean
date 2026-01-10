import * as bcrypt from 'bcryptjs';

/**
 * Service de hachage et comparaison de mots de passe
 * 
 * Utilise bcryptjs pour le hachage sécurisé des mots de passe.
 * Bcrypt est un algorithme de hachage adaptatif conçu pour être lent,
 * ce qui le rend résistant aux attaques par force brute.
 * 
 * Caractéristiques:
 * - Algorithme bcrypt (Blowfish)
 * - Salt aléatoire intégré dans le hash
 * - Coût de 10 rounds (2^10 itérations)
 * 
 * @infrastructure Service - Couche Infrastructure
 */
export class HashService {
  /** Nombre de rounds bcrypt (2^10 = 1024 itérations) */
  private readonly saltRounds = 10;

  /**
   * Hash un mot de passe avec bcrypt
   * 
   * Le salt est généré automatiquement et inclus dans le hash.
   * Le résultat est une chaîne de 60 caractères contenant:
   * - L'algorithme ($2a$ ou $2b$)
   * - Le coût (10 rounds)
   * - Le salt (22 caractères)
   * - Le hash (31 caractères)
   * 
   * @param password - Mot de passe en clair à hasher
   * @returns Hash bcrypt du mot de passe
   * 
   * @example
   * const hash = await hashService.hashPassword('MyP@ssw0rd123');
   * // Résultat: '$2a$10$N9qo8uLOickgx2ZMRZoMye...'
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare un mot de passe en clair avec son hash
   * 
   * Bcrypt extrait automatiquement le salt du hash pour la comparaison.
   * Cette méthode est résistante aux timing attacks.
   * 
   * @param password - Mot de passe en clair à vérifier
   * @param hash - Hash bcrypt à comparer
   * @returns true si le mot de passe correspond, false sinon
   * 
   * @example
   * const isValid = await hashService.comparePassword(
   *   'MyP@ssw0rd123',
   *   '$2a$10$N9qo8uLOickgx2ZMRZoMye...'
   * );
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Génère un token aléatoire sécurisé
   * 
   * Utilisé pour générer des tokens de confirmation, reset, etc.
   * Utilise des caractères alphanumériques uniquement.
   * 
   * Note: Pour une sécurité cryptographique maximale,
   * considérer l'utilisation de crypto.randomBytes() de Node.js.
   * 
   * @param length - Longueur du token à générer (par défaut: 32)
   * @returns Token aléatoire de la longueur spécifiée
   * 
   * @example
   * const token = hashService.generateSecureToken(64);
   * // Résultat: 'aB3xY9...'
   */
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      token += chars[randomIndex];
    }
    return token;
  }
}
