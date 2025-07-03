import { Controller, Get, Param, Res, NotFoundException, Headers } from '@nestjs/common';
import { UrlService } from './url.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Redirect')
@Controller()
export class RedirectController {
  constructor(private readonly urlService: UrlService) {}

  @ApiOperation({ summary: 'Redirect to original URL from shortened slug' })
  @ApiParam({ name: 'slug', description: 'URL slug to redirect', type: 'string' })
  @ApiResponse({ status: 302, description: 'Redirect to original URL' })
  @ApiResponse({ status: 400, description: 'URL not found' })
  @Get(':slug')
  async redirect(
    @Param('slug') slug: string, 
    @Res() res: any,
    @Headers('user-agent') userAgent: string
  ) {
    try {
      const url = await this.urlService.findOne(slug);

      this.urlService.incrementVisits(slug, userAgent).catch((error) => {
        console.error('Failed to increment visit count:', error);
      });

      return res.redirect(url.originalUrl);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(400).send('URL not found');
      }
      throw error;
    }
  }
}
