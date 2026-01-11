export class Article {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly authorId: string,
    public readonly authorName: string,
    public readonly authorRole: 'advisor' | 'director',
    public readonly createdAt: Date = new Date(),
    public readonly category: 'news' | 'promotion' | 'alert' | 'info' = 'news',
    public isPublished: boolean = true,
  ) {
    this.validateTitle();
    this.validateContent();
  }

  private validateTitle(): void {
    if (!this.title || this.title.trim().length < 3) {
      throw new Error('Title must be at least 3 characters');
    }
    if (this.title.length > 200) {
      throw new Error('Title must not exceed 200 characters');
    }
  }

  private validateContent(): void {
    if (!this.content || this.content.trim().length < 10) {
      throw new Error('Content must be at least 10 characters');
    }
  }

  public publish(): void {
    this.isPublished = true;
  }

  public unpublish(): void {
    this.isPublished = false;
  }

  public toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      authorId: this.authorId,
      authorName: this.authorName,
      authorRole: this.authorRole,
      createdAt: this.createdAt.toISOString(),
      category: this.category,
      isPublished: this.isPublished,
    };
  }
}
