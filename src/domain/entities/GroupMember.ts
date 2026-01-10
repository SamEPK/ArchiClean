/**
 * Rôles possibles pour un membre de groupe
 * - owner: Propriétaire du groupe (droits complets, ne peut pas être supprimé)
 * - admin: Administrateur (peut gérer les membres et les messages)
 * - member: Membre standard (participation uniquement)
 */
export type GroupMemberRole = 'owner' | 'admin' | 'member';

/**
 * Statuts possibles pour un membre de groupe
 * - active: Membre actif du groupe
 * - invited: Invité en attente d'acceptation
 * - banned: Membre banni du groupe
 */
export type GroupMemberStatus = 'active' | 'invited' | 'banned';

/**
 * Interface définissant les propriétés d'un membre de groupe
 */
export interface GroupMemberProps {
  /** Identifiant unique du membre */
  id: string;
  /** Identifiant du groupe */
  groupId: string;
  /** Identifiant de l'utilisateur */
  userId: string;
  /** Rôle du membre dans le groupe */
  role: GroupMemberRole;
  /** Statut du membre */
  status: GroupMemberStatus;
  /** Date d'adhésion au groupe */
  joinedAt: Date;
  /** Date de dernière modification */
  updatedAt?: Date;
}

/**
 * Entité GroupMember - Représente un membre d'un groupe de messagerie
 * 
 * Cette entité gère les relations entre utilisateurs et groupes,
 * incluant les rôles, statuts et opérations de gestion des membres.
 * 
 * @domain Entity - Couche Domain
 */
export class GroupMember {
  public readonly id: string;
  public readonly groupId: string;
  public readonly userId: string;
  public role: GroupMemberRole;
  public status: GroupMemberStatus;
  public readonly joinedAt: Date;
  public updatedAt?: Date;

  /**
   * Constructeur de l'entité GroupMember
   * @param props - Propriétés initiales du membre
   */
  constructor(props: GroupMemberProps) {
    this.id = props.id;
    this.groupId = props.groupId;
    this.userId = props.userId;
    this.role = props.role;
    this.status = props.status;
    this.joinedAt = props.joinedAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Promeut un membre au rôle d'administrateur
   * 
   * @throws {Error} Si le membre est déjà propriétaire (owner)
   * 
   * Règle métier: Le propriétaire ne peut pas être promu car il a déjà le rôle le plus élevé
   */
  public promoteToAdmin(): void {
    if (this.role === 'owner') {
      throw new Error('Owner cannot be promoted');
    }
    this.role = 'admin';
    this.updatedAt = new Date();
  }

  /**
   * Rétrograde un administrateur au rôle de membre standard
   * 
   * @throws {Error} Si le membre est propriétaire (owner)
   * 
   * Règle métier: Le propriétaire ne peut jamais être rétrogradé
   */
  public demoteToMember(): void {
    if (this.role === 'owner') {
      throw new Error('Owner cannot be demoted');
    }
    this.role = 'member';
    this.updatedAt = new Date();
  }

  /**
   * Accepte une invitation à rejoindre le groupe
   * 
   * @throws {Error} Si le statut n'est pas 'invited'
   * 
   * Règle métier: Seules les invitations en attente peuvent être acceptées
   */
  public acceptInvitation(): void {
    if (this.status !== 'invited') {
      throw new Error('Can only accept invitations with invited status');
    }
    this.status = 'active';
    this.updatedAt = new Date();
  }

  /**
   * Bannit un membre du groupe
   * 
   * @throws {Error} Si le membre est propriétaire (owner)
   * 
   * Règle métier: Le propriétaire ne peut jamais être banni de son propre groupe
   */
  public ban(): void {
    if (this.role === 'owner') {
      throw new Error('Cannot ban the owner');
    }
    this.status = 'banned';
    this.updatedAt = new Date();
  }

  /**
   * Réactive un membre précédemment banni
   * 
   * @throws {Error} Si le membre n'est pas banni
   * 
   * Règle métier: Seuls les membres bannis peuvent être réactivés
   */
  public unban(): void {
    if (this.status !== 'banned') {
      throw new Error('Can only unban banned members');
    }
    this.status = 'active';
    this.updatedAt = new Date();
  }

  /**
   * Vérifie si le membre est propriétaire du groupe
   * @returns true si le membre a le rôle 'owner'
   */
  public isOwner(): boolean {
    return this.role === 'owner';
  }

  /**
   * Vérifie si le membre a des droits d'administration
   * @returns true si le membre est admin ou owner
   */
  public isAdmin(): boolean {
    return this.role === 'admin' || this.role === 'owner';
  }

  /**
   * Vérifie si le membre est actif dans le groupe
   * @returns true si le statut est 'active'
   */
  public isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Vérifie si le membre a une invitation en attente
   * @returns true si le statut est 'invited'
   */
  public isInvited(): boolean {
    return this.status === 'invited';
  }

  /**
   * Vérifie si le membre est banni du groupe
   * @returns true si le statut est 'banned'
   */
  public isBanned(): boolean {
    return this.status === 'banned';
  }
}
