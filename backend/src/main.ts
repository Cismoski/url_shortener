import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    allowedHeaders: 'accept,authorization,content-type,user-agent,x-csrftoken,x-requested-with,access-control-allow-origin',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('API for shortening URLs with authentication and analytics')
    .setVersion('1.0')
    .addTag('Authentication', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('URLs', 'URL shortening and management endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') ?? 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/swagger`);
}

bootstrap();
