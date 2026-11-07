import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type {
  AiEnvelope,
  AskRequest,
  AskResponse,
  Confidence,
  EstimateRequest,
  EstimateResponse,
  ExplainRequest,
  ExplainResponse,
  OcrLabelResponse,
  OcrMeterResponse,
  OcrTokenResponse,
  RecommendRequest,
  RecommendResponse,
  SttExtractRequest,
  SttExtractResponse,
} from '@voltess/contracts';
import type { AiConfig } from './ai-config';
import { AI_CONFIG } from './ai-config';
import { AiGatewayException } from './ai-gateway.exception';
import { MockAiService } from './mock-ai.service';
import { AdapterFactory } from './adapters/adapter-factory';
import { AiExceptionFilter } from './ai-exception.filter';

interface RequestWithId {
  requestId?: string;
}

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Controller('ai')
@UseFilters(AiExceptionFilter)
export class AiController {
  constructor(
    @Inject(AI_CONFIG) private readonly config: AiConfig,
    @Inject(MockAiService) private readonly ai: MockAiService,
    @Inject(AdapterFactory) private readonly adapterFactory: AdapterFactory,
  ) {}

  /**
   * STT/estimate/recommend/explain/ask are not wired to live providers in hybrid mode.
   * Live mode requires all adapters; hybrid keeps non-OCR on deterministic mock.
   */
  private assertMockFallbackAllowed(): void {
    if (this.config.mode === 'live') {
      throw new AiGatewayException(
        HttpStatus.BAD_GATEWAY,
        'PROVIDER_ERROR',
        'Pipeline ini membutuhkan AI_MODE=live dengan semua key tersedia.',
        { mode: this.config.mode },
      );
    }
  }

  private requestId(request: RequestWithId): string {
    return request.requestId ?? 'r_missing';
  }

  private requireBody<T>(body: T | undefined, endpoint: string): T {
    if (body === undefined || body === null) {
      throw new AiGatewayException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        `Body request ${endpoint} wajib diisi.`,
      );
    }
    return body;
  }

  private liveEnvelope(
    requestId: string,
    pipeline: string,
    confidence: Confidence,
    warnings: string[],
  ): AiEnvelope {
    return {
      request_id: requestId,
      engine_version: `gemini-${pipeline}-1.0.0`,
      mode: 'live',
      confidence,
      warnings,
    };
  }

  /**
   * Converts adapter failures into the C3 error envelope instead of a
   * bare 500. The adapter already produces user-facing messages.
   */
  private async callLive<T>(
    pipeline: string,
    call: () => Promise<T>,
    provider: string = 'gemini',
  ): Promise<T> {
    try {
      return await call();
    } catch (error) {
      if (error instanceof AiGatewayException) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new AiGatewayException(
        HttpStatus.BAD_GATEWAY,
        'PROVIDER_ERROR',
        message,
        { pipeline, provider, retryable: true },
      );
    }
  }

  @Post('ocr-meter')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async ocrMeter(
    @Req() request: RequestWithId,
    @UploadedFile() file: MulterFile | undefined,
    @Body('meter_type') meterType: string | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): Promise<OcrMeterResponse> {
    const requestId = this.requestId(request);

    // Validate inputs
    if (!file) {
      throw new AiGatewayException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'File foto meter wajib diupload.',
      );
    }

    if (!meterType || (meterType !== 'prabayar' && meterType !== 'pascabayar')) {
      throw new AiGatewayException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'meter_type wajib diisi: prabayar atau pascabayar.',
      );
    }

    const adapter = this.adapterFactory.getLiveOcrAdapter();
    if (!adapter) {
      return this.ai.ocrMeter(requestId, scenario);
    }

    const result = await this.callLive('ocr-meter', () =>
      adapter.ocrMeter(file.buffer, meterType, file.mimetype),
    );

    return {
      ...this.liveEnvelope(requestId, 'ocr-meter', result.confidence, result.warnings),
      kwh: result.kwh,
      unit: result.unit,
      digits_confidence: result.digits_confidence,
      needs_retake: result.needs_retake,
      ...(result.bbox ? { bbox: result.bbox } : {}),
    };
  }

  @Post('ocr-label')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async ocrLabel(
    @Req() request: RequestWithId,
    @UploadedFile() file: MulterFile | undefined,
    @Body('appliance_hint') applianceHint: string | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): Promise<OcrLabelResponse> {
    const requestId = this.requestId(request);

    if (!file) {
      throw new AiGatewayException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'File foto label wajib diupload.',
      );
    }

    const adapter = this.adapterFactory.getLiveOcrAdapter();
    if (!adapter) {
      return this.ai.ocrLabel(requestId, scenario);
    }

    const result = await this.callLive('ocr-label', () =>
      adapter.ocrLabel(file.buffer, applianceHint, file.mimetype),
    );

    return {
      ...this.liveEnvelope(requestId, 'ocr-label', result.confidence, result.warnings),
      name: result.name,
      power_w: result.power_w,
      needs_retake: result.needs_retake,
    };
  }

  @Post('ocr-token')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async ocrToken(
    @Req() request: RequestWithId,
    @UploadedFile() file: MulterFile | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): Promise<OcrTokenResponse> {
    const requestId = this.requestId(request);

    if (!file) {
      throw new AiGatewayException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'File foto token wajib diupload.',
      );
    }

    const adapter = this.adapterFactory.getLiveOcrAdapter();
    if (!adapter) {
      return this.ai.ocrToken(requestId, scenario);
    }

    const result = await this.callLive('ocr-token', () =>
      adapter.ocrToken(file.buffer, file.mimetype),
    );

    return {
      ...this.liveEnvelope(requestId, 'ocr-token', result.confidence, result.warnings),
      date: result.date,
      amount_rp: result.amount_rp,
      kwh: result.kwh,
      remaining_kwh: result.remaining_kwh,
      needs_retake: result.needs_retake,
    };
  }

  @Post('stt-extract')
  @HttpCode(HttpStatus.OK)
  async sttExtract(
    @Req() request: RequestWithId,
    @Body() body: SttExtractRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): Promise<SttExtractResponse> {
    const requestId = this.requestId(request);
    const input = this.requireBody(body, 'stt-extract');

    const adapter = this.adapterFactory.getLiveSttAdapter();
    if (!adapter) {
      this.assertMockFallbackAllowed();
      return this.ai.sttExtract(requestId, input, scenario);
    }

    // Live STT: audio_ref should be a data URL or external URL; for now we expect
    // the E2E test to provide a real audio buffer. Production would fetch from
    // audio_ref URL or accept multipart upload.
    // Simplified: treat audio_ref as base64 data URL for E2E.
    const audioBuffer = this.decodeAudioRef(input.audio_ref);
    const result = await this.callLive('stt-extract', () =>
      adapter.sttExtract(audioBuffer, input), 'assemblyai',
    );

    return {
      ...this.liveEnvelope(requestId, 'stt-extract', 'medium', []),
      ...result,
    };
  }

  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  estimate(
    @Req() request: RequestWithId,
    @Body() body: EstimateRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): EstimateResponse {
    // Estimate calculation is deterministic (energy-calc); no live provider needed.
    const input = this.requireBody(body, 'estimate');
    return this.ai.estimate(this.requestId(request), input, scenario);
  }

  @Post('recommend')
  @HttpCode(HttpStatus.OK)
  async recommend(
    @Req() request: RequestWithId,
    @Body() body: RecommendRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): Promise<RecommendResponse> {
    const requestId = this.requestId(request);
    const input = this.requireBody(body, 'recommend');

    const adapter = this.adapterFactory.getLiveLlmAdapter();
    if (!adapter) {
      this.assertMockFallbackAllowed();
      return this.ai.recommend(requestId, input, scenario);
    }

    const result = await this.callLive('recommend', () => adapter.recommend(input), 'groq');
    return {
      ...this.liveEnvelope(requestId, 'recommend', 'medium', []),
      ...result,
    };
  }

  @Post('explain')
  @HttpCode(HttpStatus.OK)
  async explain(
    @Req() request: RequestWithId,
    @Body() body: ExplainRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): Promise<ExplainResponse> {
    const requestId = this.requestId(request);
    const input = this.requireBody(body, 'explain');

    const adapter = this.adapterFactory.getLiveLlmAdapter();
    if (!adapter) {
      this.assertMockFallbackAllowed();
      return this.ai.explain(requestId, input, scenario);
    }

    const result = await this.callLive('explain', () => adapter.explain(input), 'groq');
    return {
      ...this.liveEnvelope(requestId, 'explain', 'high', []),
      ...result,
    };
  }

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  async ask(
    @Req() request: RequestWithId,
    @Body() body: AskRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): Promise<AskResponse> {
    const requestId = this.requestId(request);
    const input = this.requireBody(body, 'ask');

    const adapter = this.adapterFactory.getLiveLlmAdapter();
    if (!adapter) {
      this.assertMockFallbackAllowed();
      return this.ai.ask(requestId, input, scenario);
    }

    const result = await this.callLive('ask', () => adapter.ask(input), 'groq');
    return {
      ...this.liveEnvelope(requestId, 'ask', 'medium', []),
      ...result,
    };
  }

  /**
   * Decode audio_ref into a Buffer. In E2E we expect a data URL like
   * "data:audio/mp3;base64,...". Production would fetch from a URL.
   */
  private decodeAudioRef(audioRef: string): Buffer {
    const match = audioRef.match(/^data:audio\/[^;]+;base64,(.+)$/);
    if (!match || !match[1]) {
      throw new AiGatewayException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'audio_ref harus berupa data URL base64 untuk sementara.',
      );
    }
    return Buffer.from(match[1], 'base64');
  }
}
