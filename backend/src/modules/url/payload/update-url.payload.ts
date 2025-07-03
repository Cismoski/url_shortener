import { IsNotEmpty, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUrlPayload {
  @ApiProperty({
    description: 'New slug for the shortened URL',
    example: 'my-new-slug',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, {
    message: 'Slug must be at least 5 characters long',
  })
  @MaxLength(12, {
    message: 'Slug must be at most 12 characters long',
  })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'Slug must contain only letters, numbers, and hyphens',
  })
  slug: string;
}
