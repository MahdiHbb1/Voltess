import { Module } from '@nestjs/common';
import type { AiConfig } from './ai-config';
import { AI_CONFIG, resolveAiConfig } from './ai-config';
import { AiController } from './ai.controller';
import { MockAiService } from './mock-ai.service';
import { AdapterFactory } from './adapters/adapter-factory';

@Module({
  controllers: [AiController],
  providers: [
    {
      provide: MockAiService,
      useFactory: (config: AiConfig) => new MockAiService(config),
      inject: [AI_CONFIG],
    },
    AdapterFactory,
    {
      provide: AI_CONFIG,
      useFactory: () => resolveAiConfig(),
    },
  ],
  exports: [MockAiService, AI_CONFIG, AdapterFactory],
})
export class AiModule {}
