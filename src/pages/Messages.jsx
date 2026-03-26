import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import useCurrentUser from "../hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import EmptyState from "../components/EmptyState";
import UserAvatar from "../components/UserAvatar";
import {
  Loader2, Send, ArrowLeft, MessageSquare, Calendar,
} from "lucide-react";
import {
  fetchBuilderDirectory,
  findBuilderByIdentifier,
  getBuilderProfilePath,
} from "@/lib/builder-directory";

/*
 * Messages — direct in-app messaging between builders.
 *
 * URL patterns handled:
 *   /messages               — conversation list
 *   /messages?to=email      — open (or create) thread with that person
 *
 * Entities used (Base44):
 *   Conversation  { participant_emails: [string], participant_names: [string],
 *                   last_message: string, last_message_date: string }
 *   Message       { conversation_id: string, sender_email: string,
 *                   sender_name: string, content: string }
 */

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toEmail = searchParams.get("to");
  const { user, loading: userLoading } = useCurrentUser();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [directoryBuilders, setDirectoryBuilders] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;

    const loadDirectory = async () => {
      try {
        const directory = await fetchBuilderDirectory();
        if (isMounted) {
          setDirectoryBuilders(directory.builders);
        }
      } catch {
        if (isMounted) {
          setDirectoryBuilders([]);
        }
      }
    };

    loadDirectory();

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  // Load all conversations for the current user
  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      setLoadingConvs(true);
      try {
        const all = await base44.entities.Conversation.list("-last_message_date", 50);
        const mine = all.filter((c) =>
          c.participant_emails?.includes(user.email)
        );
        setConversations(mine);
      } catch {
        setConversations([]);
      }
      setLoadingConvs(false);
    };
    load();
  }, [user?.email]);

  // When ?to=email is set, find or create a conversation with that person
  useEffect(() => {
    if (!toEmail || !user?.email || userLoading) return;
    const open = async () => {
      // Look for an existing conversation with exactly these two participants
      const all = await base44.entities.Conversation.list("-last_message_date", 100);
      const existing = all.find(
        (c) =>
          c.participant_emails?.includes(user.email) &&
          c.participant_emails?.includes(toEmail)
      );
      if (existing) {
        setActiveConv(existing);
      } else {
        // Fetch the other user's display name if possible
        let otherName = toEmail;
        let builder = findBuilderByIdentifier(directoryBuilders, toEmail);

        if (!builder) {
          try {
            const directory = await fetchBuilderDirectory();
            builder = findBuilderByIdentifier(directory.builders, toEmail);
          } catch {}
        }

        if (builder?.name) otherName = builder.name;

        const created = await base44.entities.Conversation.create({
          participant_emails: [user.email, toEmail],
          participant_names: [user.full_name || user.email, otherName],
          last_message: "",
          last_message_date: new Date().toISOString(),
        });
        setConversations((prev) => [created, ...prev]);
        setActiveConv(created);
      }
      // Clear ?to= param so URL stays clean after thread is open
      setSearchParams({});
    };
    open();
  }, [toEmail, user?.email, user?.full_name, userLoading, directoryBuilders]);

  // Load messages whenever the active conversation changes
  useEffect(() => {
    if (!activeConv) return;
    const load = async () => {
      setLoadingMsgs(true);
      try {
        const msgs = await base44.entities.Message.filter(
          { conversation_id: activeConv.id },
          "created_date"
        );
        setMessages(msgs);
      } catch {
        setMessages([]);
      }
      setLoadingMsgs(false);
    };
    load();

    // Resolve the other participant's info for the header
    if (user?.email && activeConv.participant_emails) {
      const otherEmail = activeConv.participant_emails.find(
        (e) => e !== user.email
      );
      const idx = activeConv.participant_emails.indexOf(otherEmail);
      const otherName =
        activeConv.participant_names?.[idx] || otherEmail || "Builder";
      const builder = findBuilderByIdentifier(directoryBuilders, otherEmail);
      setOtherUser({
        email: otherEmail,
        name: builder?.name || otherName,
        avatar: builder?.avatar || null,
        calendly_url: builder?.calendly_url || null,
      });
    }
  }, [activeConv, user?.email, directoryBuilders]);

  // Scroll to bottom when messages load or new one arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv || !user?.email) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    const msg = await base44.entities.Message.create({
      conversation_id: activeConv.id,
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      content,
    });
    setMessages((prev) => [...prev, msg]);

    // Update conversation last_message preview
    await base44.entities.Conversation.update(activeConv.id, {
      last_message: content,
      last_message_date: new Date().toISOString(),
    });
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? { ...c, last_message: content, last_message_date: new Date().toISOString() }
          : c
      )
    );
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // ── Thread view ──────────────────────────────────────────────────────────
  if (activeConv) {
    return (
      <div className="flex flex-col h-[calc(100vh-7rem)]">
        {/* Thread header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
          <button
            onClick={() => { setActiveConv(null); setMessages([]); setOtherUser(null); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <UserAvatar
            name={otherUser?.name || otherUser?.email || "Builder"}
            src={otherUser?.avatar}
            size={36}
            className="rounded-full"
          />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{otherUser?.name || "Builder"}</p>
            <p className="text-xs text-muted-foreground truncate">{otherUser?.email}</p>
          </div>

          {/* Calendly shortcut — only shows if we can infer a Calendly URL */}
          {otherUser?.calendly_url && (
            <button
              onClick={() => window.open(otherUser.calendly_url, "_blank", "noopener,noreferrer")}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Schedule meeting"
            >
              <Calendar className="w-5 h-5" />
            </button>
          )}

          <Link
            to={otherUser?.email ? getBuilderProfilePath(otherUser) : "/profile"}
            className="shrink-0"
          >
            <Button variant="outline" size="sm" className="rounded-xl text-xs h-8">
              View Profile
            </Button>
          </Link>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loadingMsgs ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-sm">Start the conversation</p>
              <p className="text-xs text-muted-foreground mt-1">
                Say hi to {otherUser?.name?.split(" ")[0] || "them"} — or share what you're building!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_email === user?.email;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  {!isMine && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                      <span className="text-primary text-xs font-semibold">
                        {msg.sender_name?.[0] || "?"}
                      </span>
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMine
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Compose */}
        <div className="px-4 py-3 border-t border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex items-end gap-2 bg-muted rounded-2xl px-3 py-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none focus:outline-none min-h-[24px] max-h-32 leading-relaxed"
              style={{ height: "auto" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="shrink-0 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center transition-opacity disabled:opacity-40"
              aria-label="Send message"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    );
  }

  // ── Conversation list ────────────────────────────────────────────────────
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-space font-bold text-xl">Messages</h1>
      </div>

      {loadingConvs ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No messages yet"
          description="Visit a builder's profile and tap Message to start a conversation."
        />
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => {
            const otherEmail = conv.participant_emails?.find(
              (e) => e !== user?.email
            );
            const idx = conv.participant_emails?.indexOf(otherEmail) ?? 0;
            const builder = findBuilderByIdentifier(directoryBuilders, otherEmail);
            const otherName =
              builder?.name || conv.participant_names?.[idx] || otherEmail || "Builder";
            const preview = conv.last_message
              ? conv.last_message.length > 60
                ? conv.last_message.slice(0, 60) + "…"
                : conv.last_message
              : "No messages yet";
            const isUnread = false; // wire to unread logic when available

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors text-left"
              >
                <div className="relative shrink-0">
                  <UserAvatar
                    name={otherName}
                    src={builder?.avatar}
                    size={48}
                    className="rounded-full"
                  />
                  {isUnread && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm truncate">{otherName}</p>
                    {conv.last_message_date && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatConvDate(conv.last_message_date)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{preview}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatConvDate(iso) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}
