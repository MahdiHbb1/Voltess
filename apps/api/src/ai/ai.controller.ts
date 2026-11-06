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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GeminiOcrAdapter } from './adapters/live/gemini-ocr.adapter';
import type {
  AskRequest,
  AskResponse,
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
} from '@voltra/contracts';
import type { AiConfig } from './ai-config';
import { AI_CONFIG } from './ai-config';
import { AiGatewayException } from './ai-gateway.exception';
import { MockAiService } from './mock-ai.service';
import { AdapterFactory } from './adapters/adapter-factory';

interface RequestWithId {
  requestId?: string;
}

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Controller('ai')
export class AiController {
  constructor(
    private readonly ai: MockAiService,
    private readonly adapterFactory: AdapterFactory,
    @Inject(AI_CONFIG) private readonly config: AiConfig,
  ) {}

  private assertMockMode(): void {
    if (this.config.mode !== 'mock') {
      throw new AiGatewayException(
        HttpStatus.BAD_GATEWAY,
        'PROVIDER_ERROR',
        'Adapter AI live/hybrid belum tersedia pada build ini. Gunakan AI_MODE=mock untuk pengembangan.',
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

    // Use mock or live adapter
    if (this.adapterFactory.isMockMode()) {
      return this.ai.ocrMeter(requestId, scenario);
    }

    // Live mode: use Gemini OCR adapter
    const adapter = this.adapterFactory.getOcrAdapter();
    if ('ocrMeter' in adapter && typeof adapter.ocrMeter === 'function') {
      const result = await (adapter as GeminiOcrAdapter).ocrMeter(file.buffer, meterType as 'prabayar' | 'pascabayar');
      
      return {
        request_id: requestId,
        engine_version: 'gemini-ocr-meter-1.0.0',
        mode: 'live',
        confidence: result.confidence,
        warnings: result.warnings,
        kwh: result.kwh,
        unit: result.unit,
        digits_confidence: result.digits_confidence,
        needs_retake: result.needs_retake,
        bbox: result.bbox,
      };
    }

    throw new Error('OCR adapter tidak tersedia');
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

    // Use mock or live adapter
    if (this.adapterFactory.isMockMode()) {
      return this.ai.ocrLabel(requestId, scenario);
    }

    // Live mode: use Gemini OCR adapter
    const adapter = this.adapterFactory.getOcrAdapter();
    if ('ocrLabel' in adapter && typeof adapter.ocrLabel === 'function') {
      const result = await (adapter as GeminiOcrAdapter).ocrLabel(file.buffer, applianceHint);
      
      return {
        request_id: requestId,
        engine_version: 'gemini-ocr-label-1.0.0',
        mode: 'live',
        confidence: result.confidence,
        warnings: result.warnings,
        name: result.name,
        power_w: result.power_w,
        needs_retake: result.needs_retake,
      };
    }

    throw new Error('OCR adapter tidak tersedia');
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

    // Use mock or live adapter
    if (this.adapterFactory.isMockMode()) {
      return this.ai.ocrToken(requestId, scenario);
    }

    // Live mode: use Gemini OCR adapter
    const adapter = this.adapterFactory.getOcrAdapter();
    if ('ocrToken' in adapter && typeof adapter.ocrToken === 'function') {
      const result = await (adapter as GeminiOcrAdapter).ocrToken(file.buffer);
      
      return {
        request_id: requestId,
        engine_version: 'gemini-ocr-token-1.0.0',
        mode: 'live',
        confidence: result.confidence,
        warnings: result.warnings,
        date: result.date,
        amount_rp: result.amount_rp,
        kwh: result.kwh,
        remaining_kwh: result.remaining_kwh,
        needs_retake: result.needs_retake,
      };
    }

    throw new Error('OCR adapter tidak tersedia');
  }

  @Post('stt-extract')
  @HttpCode(HttpStatus.OK)
  sttExtract(
    @Req() request: RequestWithId,
    @Body() body: SttExtractRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): SttExtractResponse {
    this.assertMockMode();
    const input = this.requireBody(body, 'stt-extract');
    return this.ai.sttExtract(this.requestId(request), input, scenario);
  }

  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  estimate(
    @Req() request: RequestWithId,
    @Body() body: EstimateRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): EstimateResponse {
    this.assertMockMode();
    const input = this.requireBody(body, 'estimate');
    return this.ai.estimate(this.requestId(request), input, scenario);
  }

  @Post('recommend')
  @HttpCode(HttpStatus.OK)
  recommend(
    @Req() request: RequestWithId,
    @Body() body: RecommendRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): RecommendResponse {
    this.assertMockMode();
    const input = this.requireBody(body, 'recommend');
    return this.ai.recommend(this.requestId(request), input, scenario);
  }

  @Post('explain')
  @HttpCode(HttpStatus.OK)
  explain(
    @Req() request: RequestWithId,
    @Body() body: ExplainRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): ExplainResponse {
    this.assertMockMode();
    const input = this.requireBody(body, 'explain');
    return this.ai.explain(this.requestId(request), input, scenario);
  }

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  ask(
    @Req() request: RequestWithId,
    @Body() body: AskRequest | undefined,
    @Headers('x-ai-scenario') scenario?: string,
  ): AskResponse {
    this.assertMockMode();
    const input = this.requireBody(body, 'ask');
    return this.ai.ask(this.requestId(request), input, scenario);
  }
}
