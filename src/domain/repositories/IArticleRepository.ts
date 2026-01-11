import { Article } from '../entities/Article';

export interface IArticleRepository {
  save(article: Article): Promise<Article>;
  findById(id: string): Promise<Article | null>;
  findAll(): Promise<Article[]>;
  findPublished(): Promise<Article[]>;
  findByAuthorId(authorId: string): Promise<Article[]>;
  delete(id: string): Promise<void>;
  update(article: Article): Promise<Article>;
}
