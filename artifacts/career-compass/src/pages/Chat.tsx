import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useSendChatMessage } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Compass, ArrowLeft, Send, Bot, User, Trash2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const STORAGE_KEY = "career_chat_history";
const STARTER_QUESTIONS = [
  "What career fits someone who loves both coding and design?",
  "Is software engineering still a good choice with AI taking jobs?",
  "How do I get into data science without a degree?",
  "What skills should a 16-year-old learn for the future?",
  "How do I choose between medicine and engineering?",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        return parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch { /* empty */ }
    return [];
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useSendChatMessage();

  const context = (() => {
    try {
      const analysis = sessionStorage.getItem("careerAnalysis");
      if (!analysis) return undefined;
      const parsed = JSON.parse(analysis);
      return parsed.personalizedSummary ?? undefined;
    } catch { return undefined; }
  })();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { /* empty */ }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sendMessage.isPending) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const res = await sendMessage.mutateAsync({ data: { message: content, context } });
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-home">
                <Compass className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-bold">AI Career Assistant</span>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory} className="gap-2 text-muted-foreground" data-testid="button-clear">
              <Trash2 className="w-4 h-4" /> Clear
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">AI Career Assistant</h2>
              <p className="text-muted-foreground max-w-md">Ask anything about careers, education, skills, or your future. I give direct, honest advice — no generic platitudes.</p>
              {context && (
                <div className="mt-3 text-xs text-primary/70 bg-primary/5 border border-primary/10 rounded-xl px-4 py-2 max-w-sm mx-auto">
                  Context loaded from your career analysis
                </div>
              )}
            </motion.div>

            <div className="w-full max-w-2xl">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Example questions</p>
              <div className="grid grid-cols-1 gap-2">
                {STARTER_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-left px-4 py-3 rounded-xl border border-border bg-card/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground"
                    data-testid={`starter-${i}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-4 pb-4">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-primary/20" : "bg-secondary/20"}`}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-secondary" />}
                  </div>
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-primary/15 border border-primary/20 text-foreground" : "glass-card text-foreground"}`}
                    data-testid={`message-${msg.role}`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sendMessage.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-secondary" />
                </div>
                <div className="glass-card px-4 py-3 rounded-2xl flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="sticky bottom-0 pt-4">
          <div className="glass-card rounded-2xl p-3 flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              placeholder="Ask about careers, education, skills..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none resize-none min-h-[44px] max-h-40 p-0 focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60"
              rows={1}
              data-testid="input-chat"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || sendMessage.isPending}
              size="sm"
              className="bg-primary hover:bg-primary/90 h-9 w-9 p-0 rounded-xl flex-shrink-0"
              data-testid="button-send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/50 text-center mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
