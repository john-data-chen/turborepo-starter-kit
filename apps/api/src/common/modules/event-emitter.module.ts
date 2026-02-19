import { Global, Module } from "@nestjs/common";
import { EventEmitter2 } from "eventemitter2";

@Global()
@Module({
  providers: [
    {
      provide: EventEmitter2,
      useFactory: () => new EventEmitter2()
    }
  ],
  exports: [EventEmitter2]
})
export class SimpleEventEmitterModule {}
