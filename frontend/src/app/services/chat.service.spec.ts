import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { ApiService } from './api.service';

function createSSEStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

function createControlledStream() {
  let ctrl!: ReadableStreamDefaultController<Uint8Array>;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({ start(c) { ctrl = c; } });
  return {
    stream,
    push(data: string) { ctrl.enqueue(encoder.encode(data)); },
    close() { ctrl.close(); },
    error(e: Error) { ctrl.error(e); },
  };
}

function sseResponse(chunks: string[]): Response {
  return new Response(createSSEStream(chunks), {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

function flush(): Promise<void> {
  return new Promise(r => setTimeout(r, 0));
}

describe('ChatService', () => {
  let service: ChatService;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: { baseUrl: '', url: (p: string) => p } },
      ],
    });
    service = TestBed.inject(ChatService);
    fetchSpy = spyOn(globalThis, 'fetch');
  });

  it('should be created with idle state and empty data', () => {
    expect(service).toBeTruthy();
    expect(service.state()).toBe('idle');
    expect(service.messages()).toEqual([]);
    expect(service.streamingContent()).toBe('');
    expect(service.error()).toBeNull();
  });

  describe('loadHistory', () => {
    it('should fetch and expose messages via signal', async () => {
      const mockMessages = [
        { id: 1, role: 'user', content: 'Hello', createdAt: '2026-03-31T10:00:00Z' },
        { id: 2, role: 'assistant', content: 'Hi there', createdAt: '2026-03-31T10:00:05Z' },
      ];
      fetchSpy.and.returnValue(
        Promise.resolve(new Response(JSON.stringify({ messages: mockMessages }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })),
      );

      await service.loadHistory();
      expect(service.messages().length).toBe(2);
      expect(service.messages()[0].content).toBe('Hello');
      expect(service.messages()[1].content).toBe('Hi there');
      expect(service.error()).toBeNull();
    });

    it('should set error on fetch failure', async () => {
      fetchSpy.and.returnValue(
        Promise.resolve(new Response('', { status: 500 })),
      );

      await service.loadHistory();
      expect(service.error()).toBeTruthy();
    });
  });

  describe('sendMessage — happy path', () => {
    it('should add user message to messages array', async () => {
      fetchSpy.and.returnValue(Promise.resolve(sseResponse([
        'data: {"content":"Reply"}\n\n',
        'data: [DONE]\n\n',
      ])));

      await service.sendMessage('my question');
      expect(service.messages()[0].role).toBe('user');
      expect(service.messages()[0].content).toBe('my question');
    });

    it('should accumulate delta tokens and finalize assistant message', async () => {
      fetchSpy.and.returnValue(Promise.resolve(sseResponse([
        'data: {"content":"Hello"}\n\n',
        'data: {"content":" World"}\n\n',
        'data: [DONE]\n\n',
      ])));

      await service.sendMessage('test');
      const msgs = service.messages();
      expect(msgs.length).toBe(2);
      expect(msgs[1].role).toBe('assistant');
      expect(msgs[1].content).toBe('Hello World');
    });

    it('should return to idle state after completion', async () => {
      fetchSpy.and.returnValue(Promise.resolve(sseResponse([
        'data: {"content":"Hi"}\n\n',
        'data: [DONE]\n\n',
      ])));

      await service.sendMessage('test');
      expect(service.state()).toBe('idle');
    });

    it('should clear streamingContent after completion', async () => {
      fetchSpy.and.returnValue(Promise.resolve(sseResponse([
        'data: {"content":"Hi"}\n\n',
        'data: [DONE]\n\n',
      ])));

      await service.sendMessage('test');
      expect(service.streamingContent()).toBe('');
    });

    it('should call fetch with POST method and JSON body', async () => {
      fetchSpy.and.returnValue(Promise.resolve(sseResponse([
        'data: {"content":"Hi"}\n\n',
        'data: [DONE]\n\n',
      ])));

      await service.sendMessage('hello world');
      expect(fetchSpy).toHaveBeenCalledWith('/api/chat/messages', jasmine.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'hello world' }),
      }));
    });
  });

  describe('state machine transitions', () => {
    it('should transition idle → thinking → streaming → idle', async () => {
      const { stream, push, close } = createControlledStream();
      fetchSpy.and.returnValue(Promise.resolve(
        new Response(stream, { status: 200 }),
      ));

      expect(service.state()).toBe('idle');

      const promise = service.sendMessage('test');
      expect(service.state()).toBe('thinking');

      await flush();
      expect(service.state()).toBe('thinking');

      push('data: {"content":"Hi"}\n\n');
      await flush();
      expect(service.state()).toBe('streaming');

      push('data: [DONE]\n\n');
      close();
      await promise;
      expect(service.state()).toBe('idle');
    });

    it('should transition thinking → error on fetch rejection', async () => {
      fetchSpy.and.returnValue(Promise.reject(new Error('Network error')));

      await service.sendMessage('test');
      expect(service.state()).toBe('error');
      expect(service.error()).toBe('Network error');
    });

    it('should transition thinking → error on non-200 response', async () => {
      fetchSpy.and.returnValue(Promise.resolve(
        new Response('', { status: 500 }),
      ));

      await service.sendMessage('test');
      expect(service.state()).toBe('error');
    });

    it('should transition streaming → error on mid-stream failure', async () => {
      const { stream, push, error } = createControlledStream();
      fetchSpy.and.returnValue(Promise.resolve(
        new Response(stream, { status: 200 }),
      ));

      const promise = service.sendMessage('test');
      await flush();

      push('data: {"content":"partial"}\n\n');
      await flush();
      expect(service.state()).toBe('streaming');

      error(new Error('Stream broke'));
      await promise;
      expect(service.state()).toBe('error');
      expect(service.streamingContent()).toBe('');
    });

    it('should transition to error when stream ends without [DONE]', async () => {
      const { stream, push, close } = createControlledStream();
      fetchSpy.and.returnValue(Promise.resolve(
        new Response(stream, { status: 200 }),
      ));

      const promise = service.sendMessage('test');
      await flush();

      push('data: {"content":"partial"}\n\n');
      await flush();

      close();
      await promise;
      expect(service.state()).toBe('error');
      expect(service.streamingContent()).toBe('');
    });
  });

  describe('SSE parsing', () => {
    it('should handle cross-chunk buffering', async () => {
      fetchSpy.and.returnValue(Promise.resolve(sseResponse([
        'data: {"con',
        'tent":"Hello"}\n\ndata: [DONE]\n\n',
      ])));

      await service.sendMessage('test');
      const msgs = service.messages();
      expect(msgs[msgs.length - 1].content).toBe('Hello');
    });

    it('should handle multiple events in a single chunk', async () => {
      fetchSpy.and.returnValue(Promise.resolve(sseResponse([
        'data: {"content":"A"}\n\ndata: {"content":"B"}\n\ndata: {"content":"C"}\n\ndata: [DONE]\n\n',
      ])));

      await service.sendMessage('test');
      const msgs = service.messages();
      expect(msgs[msgs.length - 1].content).toBe('ABC');
    });

    it('should handle \\n\\n separator split across chunks', async () => {
      fetchSpy.and.returnValue(Promise.resolve(sseResponse([
        'data: {"content":"X"}\n',
        '\ndata: [DONE]\n\n',
      ])));

      await service.sendMessage('test');
      const msgs = service.messages();
      expect(msgs[msgs.length - 1].content).toBe('X');
    });
  });

  describe('[HOLDING:TICKER] detection', () => {
    it('should detect holding tickers in text', () => {
      const tickers = ChatService.extractHoldingTickers(
        'Check out [HOLDING:AAPL] and [HOLDING:BTC] for details',
      );
      expect(tickers).toContain('AAPL');
      expect(tickers).toContain('BTC');
      expect(tickers.length).toBe(2);
    });

    it('should return empty array for text without holdings', () => {
      expect(ChatService.extractHoldingTickers('No holdings here')).toEqual([]);
    });

    it('should deduplicate detected tickers', () => {
      const tickers = ChatService.extractHoldingTickers(
        '[HOLDING:AAPL] is great, [HOLDING:AAPL] really!',
      );
      expect(tickers.length).toBe(1);
      expect(tickers[0]).toBe('AAPL');
    });

    it('should expose detected holdings during streaming', async () => {
      const { stream, push, close } = createControlledStream();
      fetchSpy.and.returnValue(Promise.resolve(
        new Response(stream, { status: 200 }),
      ));

      const promise = service.sendMessage('test');
      await flush();

      push('data: {"content":"Look at [HOLDING:TSLA]"}\n\n');
      await flush();

      const tickers = ChatService.extractHoldingTickers(service.streamingContent());
      expect(tickers).toContain('TSLA');

      push('data: [DONE]\n\n');
      close();
      await promise;
    });
  });

  describe('dismissError', () => {
    it('should transition error → idle and clear error', async () => {
      fetchSpy.and.returnValue(Promise.reject(new Error('fail')));
      await service.sendMessage('test');
      expect(service.state()).toBe('error');
      expect(service.error()).toBeTruthy();

      service.dismissError();
      expect(service.state()).toBe('idle');
      expect(service.error()).toBeNull();
    });
  });

  describe('single conversation', () => {
    it('should accumulate messages across multiple sends', async () => {
      fetchSpy.and.returnValues(
        Promise.resolve(sseResponse([
          'data: {"content":"Reply 1"}\n\n',
          'data: [DONE]\n\n',
        ])),
        Promise.resolve(sseResponse([
          'data: {"content":"Reply 2"}\n\n',
          'data: [DONE]\n\n',
        ])),
      );

      await service.sendMessage('Q1');
      await service.sendMessage('Q2');

      const msgs = service.messages();
      expect(msgs.length).toBe(4);
      expect(msgs[0].content).toBe('Q1');
      expect(msgs[1].content).toBe('Reply 1');
      expect(msgs[2].content).toBe('Q2');
      expect(msgs[3].content).toBe('Reply 2');
    });
  });
});
