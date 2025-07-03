import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUrlPayload } from './payload/create-url.payload';
import { UpdateUrlPayload } from './payload/update-url.payload';
import { nanoid } from 'nanoid';
import { UAParser } from 'ua-parser-js';
import { Url } from 'generated/prisma';
import { UrlDto } from './dto/url.dto';
import { UrlAnalyticsDto, VisitDataPoint } from './dto/url-analytics.dto';

@Injectable()
export class UrlService {
  constructor(private prisma: PrismaService) {}

  private readonly FORBIDDEN_SLUGS = ['api', 'swagger'];

  async create(createUrlDto: CreateUrlPayload, userId: bigint): Promise<UrlDto> {
    const { originalUrl, customSlug } = createUrlDto;

    let slug: string;

    if (customSlug != null) {
      if (this.FORBIDDEN_SLUGS.includes(customSlug)) {
        throw new BadRequestException('Custom slug already in use');
      }

      const existingUrl = await this.prisma.url.findUnique({
        where: { slug: customSlug },
      });

      if (existingUrl) {
        throw new BadRequestException('Custom slug already in use');
      }

      slug = customSlug;
    } else {
      slug = nanoid(5);

      while (true) {
        const existingUrl = await this.prisma.url.findUnique({
          where: { slug },
        });

        if (existingUrl == null) {
          break;
        }

        slug = nanoid(5);
      }
    }

    const url = await this.prisma.url.create({
      data: {
        originalUrl,
        slug,
        userId,
      },
    });

    return this._formatUrl(url);
  }

  async findAll(userId: bigint): Promise<UrlDto[]> {
    const urls = await this.prisma.url.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return urls.map((url) => this._formatUrl(url));
  }

  async findOne(slug: string): Promise<UrlDto> {
    const url = await this.prisma.url.findUnique({
      where: { slug, isDeleted: false },
    });

    if (url == null || url.isDeleted) {
      throw new BadRequestException('URL not found');
    }

    return this._formatUrl(url);
  }

  async updateSlug(originalSlug: string, updateUrlDto: UpdateUrlPayload, userId: bigint): Promise<UrlDto> {
    let { slug } = updateUrlDto;

    if (this.FORBIDDEN_SLUGS.includes(slug)) {
      throw new BadRequestException('Slug already in use');
    }

    const existingUrl = await this.prisma.url.findFirst({
      where: {
        slug: originalSlug,
        userId,
        isDeleted: false,
      },
    });

    if (existingUrl == null) {
      throw new BadRequestException('URL not found');
    }

    const slugExists = await this.prisma.url.findFirst({
      where: { slug, isDeleted: false },
    });

    if (slugExists) {
      throw new BadRequestException('Slug already in use');
    }

    const updatedUrl = await this.prisma.url.update({
      where: { slug: originalSlug },
      data: { slug },
    });

    return this._formatUrl(updatedUrl);
  }

  async incrementVisits(slug: string, userAgent?: string): Promise<void> {
    const url = await this.prisma.url.findUnique({
      where: { slug, isDeleted: false },
    });

    if (url == null || url.isDeleted) {
      throw new BadRequestException('URL not found');
    }

    await this.prisma.url.update({
      where: { id: url.id },
      data: { totalVisits: { increment: 1 } },
    });

    // Parse user agent if available
    let browser: string | null = null;
    let device: string | null = null;
    let os: string | null = null;

    if (userAgent) {
      try {
        const parser = new UAParser(userAgent);
        const browserInfo = parser.getBrowser();
        const deviceInfo = parser.getDevice();
        const osInfo = parser.getOS();

        browser = browserInfo.name || null;
        device = deviceInfo.type || (deviceInfo.vendor ? `${deviceInfo.vendor} ${deviceInfo.model || ''}`.trim() : null);
        os = osInfo.name || null;
      } catch (error) {
        console.error('Error parsing user agent:', error);
      }
    }

    const currentDate = new Date();
    await this.prisma.urlVisit.create({
      data: {
        urlId: url.id,
        day: currentDate.getDate(),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        hour: currentDate.getHours(),
        browser,
        device,
        os,
      },
    });
  }

  async softDelete(slug: string, userId: bigint): Promise<void> {
    const existingUrl = await this.prisma.url.findFirst({
      where: {
        slug,
        userId,
        isDeleted: false,
      },
    });

    if (existingUrl == null) {
      throw new BadRequestException('URL not found');
    }

    await this.prisma.url.update({
      where: { id: existingUrl.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  private _formatUrl(url: Url): UrlDto {
    return {
      slug: url.slug,
      originalUrl: url.originalUrl,
      visits: url.totalVisits,
      createdAt: url.createdAt,
    };
  }

  async getUrlAnalytics(slug: string, userId?: bigint, timeFilter?: string): Promise<UrlAnalyticsDto> {
    // Find the URL
    const url = await this.prisma.url.findUnique({
      where: { slug, isDeleted: false, userId },
    });

    if (url == null) {
      throw new BadRequestException('URL not found');
    }

    // Calculate date range based on timeFilter
    const today = new Date();
    let startDate = new Date(today);
    let daysToShow = 30; // Default to 30 days

    if (timeFilter) {
      switch (timeFilter) {
        case 'day':
          startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0);
          daysToShow = 1;
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          daysToShow = 7;
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          startDate.setHours(0, 0, 0, 0);
          daysToShow = 30;
          break;
        case 'year':
          startDate.setFullYear(today.getFullYear() - 1);
          startDate.setHours(0, 0, 0, 0);
          daysToShow = 365;
          break;
        default:
          startDate.setDate(today.getDate() - 30); // Default to last 30 days
      }
    } else {
      startDate.setDate(today.getDate() - 30); // Default to last 30 days
    }

    // Get all visit records for this URL
    const visits = await this.prisma.urlVisit.findMany({
      where: {
        urlId: url.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group visits by date
    const visitsByDate = new Map<string, number>();

    // Initialize all dates in the range with 0 visits
    for (let i = 0; i <= daysToShow; i++) {
      const date = new Date(startDate);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString(); // YYYY-MM-DD format
      visitsByDate.set(dateString, 0);
    }

    // Track browser, device, and OS statistics
    const browserCounts = new Map<string, number>();
    const deviceCounts = new Map<string, number>();
    const osCounts = new Map<string, number>();

    // Count visits for each date and track browser/device info
    for (const visit of visits) {
      const visitDate = new Date(visit.createdAt);
      visitDate.setHours(0, 0, 0, 0);
      const dateString = visitDate.toISOString();
      visitsByDate.set(dateString, (visitsByDate.get(dateString) || 0) + 1);

      // Track browser stats
      if (visit.browser) {
        browserCounts.set(visit.browser, (browserCounts.get(visit.browser) || 0) + 1);
      }

      // Track device stats
      if (visit.device) {
        deviceCounts.set(visit.device, (deviceCounts.get(visit.device) || 0) + 1);
      }

      // Track OS stats
      if (visit.os) {
        osCounts.set(visit.os, (osCounts.get(visit.os) || 0) + 1);
      }
    }

    // Convert to array of data points
    const visitData: VisitDataPoint[] = Array.from(visitsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Convert browser stats to array
    const browserStats = Array.from(browserCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Convert device stats to array
    const deviceStats = Array.from(deviceCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Convert OS stats to array
    const osStats = Array.from(osCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      slug: url.slug,
      originalUrl: url.originalUrl,
      totalVisits: url.totalVisits,
      visitData,
      browserStats,
      deviceStats,
      osStats,
    };
  }
}
