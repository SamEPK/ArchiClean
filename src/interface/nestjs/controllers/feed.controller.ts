import { Controller, Get, Post, Body, Param, Delete, Sse, Query, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable, interval, map, merge } from 'rxjs';
import { Article } from '@domain/entities/Article';
import { IArticleRepository } from '@domain/repositories/IArticleRepository';
import { SSEService } from '@infrastructure/services/SSEService';
import { uuidv4 } from '@infrastructure/utils/uuid-helper';

// DTOs
class CreateArticleDto {
  title!: string;
  content!: string;
  authorId!: string;
  authorName!: string;
  authorRole!: 'advisor' | 'director';
  category?: 'news' | 'promotion' | 'alert' | 'info';
}

@ApiTags('Feed - Actualités')
@Controller('feed')
export class FeedController {
  constructor(
    @Inject('ArticleRepository')
    private readonly articleRepository: IArticleRepository,
    private readonly sseService: SSEService,
  ) {}

  // ==================== SSE ENDPOINT ====================
  
  @Get('stream')
  @Sse()
  @ApiOperation({ 
    summary: 'Flux SSE des actualités', 
    description: 'Server-Sent Events pour recevoir les nouvelles actualités en temps réel' 
  })
  streamArticles(): Observable<MessageEvent> {
    console.log('[Feed SSE] New client connected to article stream');
    
    // Envoyer un heartbeat toutes les 30 secondes pour maintenir la connexion
    const heartbeat = interval(30000).pipe(
      map(() => ({ data: JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() }) } as MessageEvent))
    );
    
    // Fusionner le flux d'articles avec le heartbeat
    return merge(this.sseService.getArticleStream(), heartbeat);
  }

  @Get('stream/:userId')
  @Sse()
  @ApiOperation({ 
    summary: 'Flux SSE personnalisé', 
    description: 'Server-Sent Events pour recevoir actualités + notifications personnelles' 
  })
  streamUserFeed(@Param('userId') userId: string): Observable<MessageEvent> {
    console.log('[Feed SSE] New client connected to user feed:', userId);
    
    // Heartbeat toutes les 30 secondes
    const heartbeat = interval(30000).pipe(
      map(() => ({ data: JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() }) } as MessageEvent))
    );
    
    return merge(this.sseService.getUserFeedStream(userId), heartbeat);
  }

  // ==================== REST ENDPOINTS ====================

  @Post()
  @ApiOperation({ summary: 'Créer une actualité', description: 'Réservé aux conseillers et directeurs' })
  @ApiResponse({ status: 201, description: 'Actualité créée et diffusée' })
  async createArticle(@Body() dto: CreateArticleDto) {
    // Vérifier le rôle (seuls advisors et directors peuvent créer)
    if (!['advisor', 'director'].includes(dto.authorRole)) {
      throw new ForbiddenException('Seuls les conseillers et directeurs peuvent créer des actualités');
    }

    const article = new Article(
      uuidv4(),
      dto.title,
      dto.content,
      dto.authorId,
      dto.authorName,
      dto.authorRole,
      new Date(),
      dto.category || 'news',
      true,
    );

    await this.articleRepository.save(article);
    
    // Diffuser via SSE à tous les clients connectés
    this.sseService.emitArticle(article.toJSON());

    console.log('[Feed] New article created and broadcasted:', article.title);

    return {
      success: true,
      message: 'Actualité créée et diffusée',
      article: article.toJSON(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Liste des actualités publiées' })
  async getPublishedArticles(
    @Query('limit') limit?: number,
    @Query('category') category?: string,
  ) {
    let articles = await this.articleRepository.findPublished();
    
    if (category) {
      articles = articles.filter(a => a.category === category);
    }
    
    if (limit) {
      articles = articles.slice(0, Number(limit));
    }

    return {
      success: true,
      count: articles.length,
      articles: articles.map(a => a.toJSON()),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une actualité' })
  async getArticle(@Param('id') id: string) {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new NotFoundException('Actualité non trouvée');
    }
    return article.toJSON();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une actualité' })
  async deleteArticle(@Param('id') id: string) {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new NotFoundException('Actualité non trouvée');
    }
    await this.articleRepository.delete(id);
    return { success: true, message: 'Actualité supprimée' };
  }

  @Get('author/:authorId')
  @ApiOperation({ summary: 'Actualités d\'un auteur' })
  async getArticlesByAuthor(@Param('authorId') authorId: string) {
    const articles = await this.articleRepository.findByAuthorId(authorId);
    return {
      success: true,
      count: articles.length,
      articles: articles.map(a => a.toJSON()),
    };
  }
}
