import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { API_PORT } from "./constants/api";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(API_PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
