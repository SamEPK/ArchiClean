import { Article } from '@domain/entities/Article';
import { IArticleRepository } from '@domain/repositories/IArticleRepository';

export class InMemoryArticleRepository implements IArticleRepository {
  private articles: Map<string, Article> = new Map();

  async save(article: Article): Promise<Article> {
    this.articles.set(article.id, article);
    return article;
  }

  async findById(id: string): Promise<Article | null> {
    return this.articles.get(id) || null;
  }

  async findAll(): Promise<Article[]> {
    return Array.from(this.articles.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async findPublished(): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(a => a.isPublished)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByAuthorId(authorId: string): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(a => a.authorId === authorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(id: string): Promise<void> {
    this.articles.delete(id);
  }

  async update(article: Article): Promise<Article> {
    if (!this.articles.has(article.id)) {
      throw new Error('Article not found');
    }
    this.articles.set(article.id, article);
    return article;
  }

  clear(): void {
    this.articles.clear();
  }
}
