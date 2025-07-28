import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { API_PORT } from "./constants/api";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS to allow requests from the frontend
  app.enableCors({
    origin: "http://localhost:3000", // Your frontend URL
    credentials: true, // Required when using credentials: 'include' in fetch
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
  });

  await app.listen(API_PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
