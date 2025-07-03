import { IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlPayload {
  @ApiProperty({
    description: 'Original URL to be shortened',
    example: 'https://example.com/very-long-url-that-needs-shortening',
    required: true,
  })
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  @IsNotEmpty()
  originalUrl: string;

  @ApiProperty({
    description: 'Custom slug for the shortened URL (optional)',
    example: 'my-custom-slug',
    required: false,
  })
  @MinLength(5, {
    message: 'Slug must be at least 5 characters long',
  })
  @MaxLength(12, {
    message: 'Slug must be at most 12 characters long',
  })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'Slug must contain only letters, numbers, and hyphens',
  })
  @IsString()
  @IsOptional()
  customSlug?: string;
}
