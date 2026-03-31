import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Search,
  Globe,
  Loader2,
  ChevronLeft,
  Terminal,
  Zap,
  Sparkles,
  ArrowRight,
  Database,
  Building2,
  FileSearch,
  CheckCircle2,
  Gem,
  BrainCircuit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Types ─── */
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCallInfo[];
}

interface ToolCallInfo {
  name: string;
  args: Record<string, unknown>;
  status: "running" | "done";
}

/* ─── Streaming fetch helper ─── */
async function streamChat(
  messages: { role: string; content: string }[],
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  signal?: AbortSignal
) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const res = await fetch(`${supabaseUrl}/functions/v1/research-assistant`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    onError(err);
    return;
  }

  const contentType = res.headers.get("content-type") || "";

  // SSE stream (text/event-stream from DeepSeek passthrough)
  if (contentType.includes("text/event-stream") && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) onToken(delta);
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
    onDone();
  } else {
    // JSON fallback (non-streaming response)
    const data = await res.json();
    if (data.content) {
      onToken(data.content);
    } else if (data.error) {
      onError(data.error);
    }
    onDone();
  }
}

/* ─── Component ─── */
const ResearchAssistant = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
        if (el) el.scrollTop = el.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        toolCalls: [
          { name: "analyzing", args: {}, status: "running" },
        ],
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsStreaming(true);

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const controller = new AbortController();
      abortRef.current = controller;

      await streamChat(
        history,
        (token) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") {
              last.content += token;
              // Once we start getting tokens, mark tool calls as done
              if (last.toolCalls?.[0]?.status === "running") {
                last.toolCalls[0].status = "done";
              }
            }
            return [...updated];
          });
        },
        () => {
          setIsStreaming(false);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant" && last.toolCalls) {
              last.toolCalls = last.toolCalls.map((tc) => ({
                ...tc,
                status: "done" as const,
              }));
            }
            return [...updated];
          });
        },
        (error) => {
          setIsStreaming(false);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") {
              last.content = `⚠️ Error: ${error}`;
              last.toolCalls = [];
            }
            return [...updated];
          });
        },
        controller.signal
      );
    },
    [input, isStreaming, messages, scrollToBottom]
  );

  const starterPrompts = [
    {
      icon: Building2,
      label: "New Construction in Miami",
      prompt: "Find recent new construction building permits filed in Miami, FL. Focus on projects over $100k.",
    },
    {
      icon: Zap,
      label: "Solar Projects in Austin",
      prompt: "Search for high-value solar installation permits in Austin, TX with estimated values over $50,000.",
    },
    {
      icon: Search,
      label: "Roofing Leads in Dallas",
      prompt: "Scrape roofing permit data for Dallas, TX and identify the top opportunities.",
    },
    {
      icon: Gem,
      label: "Elite ZIP Analysis",
      prompt: "Research building permits in ZIP code 90210 and identify upscale renovation trends.",
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ─── Header ─── */}
      <header className="flex-none h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-primary/10 shrink-0"
          >
            <ChevronLeft size={20} className="text-muted-foreground" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-primary/30 rounded-xl blur-md animate-pulse" />
              <div className="relative bg-primary/20 p-2 rounded-xl border border-primary/30">
                <BrainCircuit size={20} className="text-primary" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-base md:text-lg font-bold leading-tight">
                RESEARCH <span className="text-gradient-primary">ASSISTANT</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                AI-Powered Market Intel
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/40">
            <Globe size={12} className="text-primary" />
            <span className="text-[11px] font-medium text-muted-foreground">Web Search</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/40">
            <Database size={12} className="text-primary" />
            <span className="text-[11px] font-medium text-muted-foreground">Deep Scraping</span>
          </div>
        </div>
      </header>

      {/* ─── Chat Area ─── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea ref={scrollRef} className="flex-1">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6 pb-8">
            {/* Empty state */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-10 pt-16 md:pt-24 text-center"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-wider mb-4">
                    <Sparkles size={14} /> Powered by Firecrawl
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight">
                    What do you want to{" "}
                    <span className="text-gradient-primary">investigate?</span>
                  </h2>
                  <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                    Real-time market permits, contractor data, and project leads across the USA — scraped and analyzed by AI.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                  {starterPrompts.map((item, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => {
                        setInput(item.prompt);
                        inputRef.current?.focus();
                      }}
                      className="group p-4 rounded-2xl border border-border/40 bg-background/60 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 text-left relative overflow-hidden"
                    >
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                        <ArrowRight size={14} className="text-primary" />
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <item.icon size={16} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm mb-1">{item.label}</h3>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.prompt}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center mt-1 border border-primary/20">
                      <Bot size={16} className="text-primary" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-3 ${message.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                    {/* Tool call badges */}
                    {message.role === "assistant" && message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.toolCalls.map((tc, i) => (
                          <div
                            key={i}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                              tc.status === "running"
                                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                                : "bg-green-500/10 border-green-500/30 text-green-500"
                            }`}
                          >
                            {tc.status === "running" ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={10} />
                            )}
                            {tc.status === "running" ? "Researching..." : "Research Complete"}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message bubble */}
                    {message.content && (
                      <div
                        className={`inline-block p-4 rounded-2xl shadow-lg leading-relaxed ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground font-medium rounded-br-md"
                            : "bg-muted/30 border border-border/50 rounded-bl-md backdrop-blur-sm"
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                      </div>
                    )}

                    {/* Streaming indicator for empty assistant messages */}
                    {message.role === "assistant" && !message.content && isStreaming && (
                      <div className="bg-muted/30 border border-border/50 p-4 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center mt-1 border border-border/50">
                      <User size={16} className="text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* ─── Input Bar ─── */}
        <div className="flex-none p-4 md:p-6 bg-background/80 backdrop-blur-xl border-t border-border/40">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-blue-500/40 to-primary/40 rounded-2xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-500" />
              <div className="relative flex items-center gap-2 bg-muted/60 border border-border/50 rounded-2xl p-2 focus-within:border-primary/40 transition-all shadow-2xl shadow-black/10">
                <div className="pl-2">
                  <Sparkles size={18} className="text-primary/50" />
                </div>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about permits, market trends, or scrape a specific site..."
                  className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-base h-10 placeholder:text-muted-foreground/50"
                  disabled={isStreaming}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isStreaming || !input.trim()}
                  className={`h-10 w-10 rounded-xl shrink-0 transition-all duration-300 ${
                    input.trim()
                      ? "bg-primary shadow-lg shadow-primary/30 hover:shadow-primary/50"
                      : "bg-muted-foreground/10"
                  }`}
                >
                  {isStreaming ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between px-2">
              <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/50">
                <span className="flex items-center gap-1 text-primary/60">
                  <Building2 size={10} /> Permits
                </span>
                <span className="flex items-center gap-1">
                  <FileSearch size={10} /> Scrape
                </span>
                <span className="flex items-center gap-1">
                  <Terminal size={10} /> AI Agent
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground/40 font-medium">
                Powered by Firecrawl & DeepSeek
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResearchAssistant;
