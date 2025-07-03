import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, ParseIntPipe, Query } from '@nestjs/common';
import { UrlService } from './url.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CreateUrlPayload } from './payload/create-url.payload';
import { UpdateUrlPayload } from './payload/update-url.payload';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UrlAnalyticsDto } from './dto/url-analytics.dto';

@ApiTags('URLs')
@ApiBearerAuth()
@Controller('api/urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiResponse({
    status: 201,
    description: 'URL successfully shortened',
    schema: {
      properties: {
        id: { type: 'string', example: '1' },
        originalUrl: { type: 'string', example: 'https://example.com/very-long-url' },
        slug: { type: 'string', example: 'abc123' },
        visits: { type: 'number', example: 0 },
        userId: { type: 'string', example: '1' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Post()
  create(@Body() createUrlDto: CreateUrlPayload, @Request() req) {
    return this.urlService.create(createUrlDto, BigInt(req.user.id));
  }

  @ApiOperation({ summary: 'Get all shortened URLs for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of all URLs created by the user',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string', example: '1' },
          originalUrl: { type: 'string', example: 'https://example.com/very-long-url' },
          slug: { type: 'string', example: 'abc123' },
          visits: { type: 'number', example: 5 },
          userId: { type: 'string', example: '1' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.urlService.findAll(BigInt(req.user.id));
  }

  @ApiOperation({ summary: 'Update the slug of a shortened URL' })
  @ApiParam({ name: 'slug', description: 'URL slug', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'URL slug successfully updated',
    schema: {
      properties: {
        id: { type: 'string', example: '1' },
        originalUrl: { type: 'string', example: 'https://example.com/very-long-url' },
        slug: { type: 'string', example: 'new-slug' },
        visits: { type: 'number', example: 5 },
        userId: { type: 'string', example: '1' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UseGuards(JwtAuthGuard)
  @Put(':slug')
  update(@Param('slug') slug: string, @Body() updateUrlDto: UpdateUrlPayload, @Request() req) {
    return this.urlService.updateSlug(slug, updateUrlDto, BigInt(req.user.id));
  }

  @ApiOperation({ summary: 'Delete a shortened URL (soft delete)' })
  @ApiParam({ name: 'slug', description: 'URL slug', type: 'string' })
  @ApiResponse({ status: 200, description: 'URL successfully deleted' })
  @ApiResponse({ status: 400, description: 'URL not found' })
  @UseGuards(JwtAuthGuard)
  @Delete(':slug')
  remove(@Param('slug') slug: string, @Request() req) {
    return this.urlService.softDelete(slug, BigInt(req.user.id));
  }

  @ApiOperation({ summary: 'Get analytics data for a specific URL' })
  @ApiParam({ name: 'slug', description: 'URL slug', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'URL analytics data',
    type: UrlAnalyticsDto
  })
  @ApiResponse({ status: 400, description: 'URL not found or access denied' })
  @UseGuards(JwtAuthGuard)
  @Get(':slug/analytics')
  getAnalytics(
    @Param('slug') slug: string, 
    @Request() req,
    @Query('timeFilter') timeFilter?: string
  ) {
    return this.urlService.getUrlAnalytics(slug, BigInt(req.user.id), timeFilter);
  }
}
