import { ApiProperty } from '@nestjs/swagger';

export class VisitDataPoint {
  @ApiProperty({ description: 'Date of the visit data point' })
  date: string;

  @ApiProperty({ description: 'Number of visits on this date' })
  count: number;
}

export class BrowserStats {
  @ApiProperty({ description: 'Browser name' })
  name: string;

  @ApiProperty({ description: 'Number of visits from this browser' })
  count: number;
}

export class DeviceStats {
  @ApiProperty({ description: 'Device type' })
  type: string;

  @ApiProperty({ description: 'Number of visits from this device type' })
  count: number;
}

export class OsStats {
  @ApiProperty({ description: 'Operating system name' })
  name: string;

  @ApiProperty({ description: 'Number of visits from this OS' })
  count: number;
}

export class UrlAnalyticsDto {
  @ApiProperty({ description: 'Slug of the URL' })
  slug: string;

  @ApiProperty({ description: 'Original URL' })
  originalUrl: string;

  @ApiProperty({ description: 'Total number of visits' })
  totalVisits: number;

  @ApiProperty({ description: 'Visit data points grouped by date', type: [VisitDataPoint] })
  visitData: VisitDataPoint[];
  
  @ApiProperty({ description: 'Browser statistics', type: [BrowserStats] })
  browserStats: BrowserStats[];
  
  @ApiProperty({ description: 'Device statistics', type: [DeviceStats] })
  deviceStats: DeviceStats[];
  
  @ApiProperty({ description: 'Operating system statistics', type: [OsStats] })
  osStats: OsStats[];
}
