import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AUTOMATED_RESPONSES, DEFAULT_RESPONSE, PLATFORM_EMAILS } from '@/lib/chat-constants';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const LiveChat = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && messages.length === 0) {
      // Send initial greeting after a short delay
      setTimeout(() => {
        const greeting: Message = {
          id: crypto.randomUUID(),
          text: t('chat.welcomeMessage', `Hello! 👋 Welcome to Win Trade Invest support.\n\nHow can I help you today?\n\nYou can ask about:\n• Deposits & Withdrawals\n• Investment Plans\n• KYC Verification\n• Account Issues\n\nOr just type your question!`),
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([greeting]);
      }, 500);
    }
  }, [isOpen, isMinimized, messages.length, t]);

  const findAutomatedResponse = (userMessage: string): { response: string; responseKey: string } => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const autoResponse of AUTOMATED_RESPONSES) {
      if (autoResponse.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return { response: autoResponse.response, responseKey: autoResponse.responseKey };
      }
    }
    
    return DEFAULT_RESPONSE;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay (500-1500ms)
    const typingDelay = Math.random() * 1000 + 500;
    
    setTimeout(() => {
      const { response } = findAutomatedResponse(userMessage.text);
      
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, typingDelay);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          "bg-primary text-primary-foreground",
          isOpen && !isMinimized && "scale-0 opacity-0"
        )}
        aria-label={t('chat.openChat', 'Open chat')}
      >
        <MessageCircle className="h-6 w-6" />
        {messages.length === 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none",
          isMinimized && "h-14"
        )}
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[calc(100vh-120px)]">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{t('chat.title', 'Live Support')}</h3>
                <p className="text-xs opacity-80">{t('chat.online', 'Online')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.isUser ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2",
                          message.isUser
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            message.isUser ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['Withdrawal', 'Deposit', 'Investment', 'Support'].map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        setInputValue(action);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full whitespace-nowrap transition-colors"
                    >
                      {t(`chat.quick${action}`, action)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 pt-2 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('chat.placeholder', 'Type your message...')}
                    className="flex-1 rounded-full"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    size="icon"
                    className="rounded-full h-10 w-10"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {t('chat.emailNote', 'Email: ')}
                  <a href={`mailto:${PLATFORM_EMAILS.support}`} className="text-primary hover:underline">
                    {PLATFORM_EMAILS.support}
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LiveChat;
