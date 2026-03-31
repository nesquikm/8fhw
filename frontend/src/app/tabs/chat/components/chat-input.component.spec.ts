import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatInputComponent } from './chat-input.component';

describe('ChatInputComponent', () => {
  let component: ChatInputComponent;
  let fixture: ComponentFixture<ChatInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit messageSent on send with trimmed value', () => {
    let emittedValue = '';
    component.messageSent.subscribe((v: string) => emittedValue = v);
    component.inputValue.set('  Hello world  ');
    component.send();
    expect(emittedValue).toBe('Hello world');
  });

  it('should clear input after sending', () => {
    component.inputValue.set('test message');
    component.messageSent.subscribe(() => {});
    component.send();
    expect(component.inputValue()).toBe('');
  });

  it('should not send when input is empty', () => {
    let sent = false;
    component.messageSent.subscribe(() => sent = true);
    component.inputValue.set('   ');
    component.send();
    expect(sent).toBeFalse();
  });

  it('should not send when canSend is false', () => {
    let sent = false;
    fixture.componentRef.setInput('canSend', false);
    fixture.detectChanges();
    component.messageSent.subscribe(() => sent = true);
    component.inputValue.set('Hello');
    component.send();
    expect(sent).toBeFalse();
  });

  it('should disable send button when input is empty', () => {
    component.inputValue.set('');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.send-button');
    expect(button.disabled).toBeTrue();
  });

  it('should prefill input value', () => {
    component.prefill('What about AAPL?');
    expect(component.inputValue()).toBe('What about AAPL?');
  });

  it('should render placeholder text', () => {
    const input = fixture.nativeElement.querySelector('.chat-input');
    expect(input.placeholder).toBe('Ask about your portfolio...');
  });
});
