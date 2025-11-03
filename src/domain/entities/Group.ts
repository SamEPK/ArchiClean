export type GroupVisibility = 'public' | 'private';

export interface GroupProps {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  visibility: GroupVisibility;
  createdAt: Date;
  updatedAt?: Date;
}

export class Group {
  public readonly id: string;
  public name: string;
  public description?: string;
  public readonly creatorId: string;
  public visibility: GroupVisibility;
  public readonly createdAt: Date;
  public updatedAt?: Date;

  constructor(props: GroupProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.creatorId = props.creatorId;
    this.visibility = props.visibility;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public updateInfo(name?: string, description?: string): void {
    if (name && name.trim().length > 0) {
      this.name = name.trim();
    }
    if (description !== undefined) {
      this.description = description.trim() || undefined;
    }
    this.updatedAt = new Date();
  }

  public changeVisibility(visibility: GroupVisibility): void {
    this.visibility = visibility;
    this.updatedAt = new Date();
  }

  public isPublic(): boolean {
    return this.visibility === 'public';
  }

  public isPrivate(): boolean {
    return this.visibility === 'private';
  }
}
