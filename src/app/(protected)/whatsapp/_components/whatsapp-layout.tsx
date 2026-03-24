"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Archive,
  Check,
  CheckCheck,
  Circle,
  Download,
  File,
  Image as ImageIcon,
  Loader2,
  Mail,
  MailOpen,
  MessageCircle,
  Mic,
  MoreVertical,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings2,
  Smartphone,
  Square,
  Tag,
  Unplug,
  UserPlus,
  Users,
  Video,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { checkWhatsappStatus } from "@/actions/check-whatsapp-status";
import { createWhatsappInstance } from "@/actions/create-whatsapp-instance";
import { disconnectWhatsapp } from "@/actions/disconnect-whatsapp";
import { fetchWhatsappMessages } from "@/actions/fetch-whatsapp-messages";
import {
  addConversationLabel,
  removeConversationLabel,
} from "@/actions/manage-conversation-labels";
import {
  sendWhatsappMedia,
  sendWhatsappMessage,
} from "@/actions/send-whatsapp-message";
import { toggleConversationArchive } from "@/actions/toggle-conversation-archive";
import { toggleConversationRead } from "@/actions/toggle-conversation-read";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import ConvertContactDialog from "./convert-contact-dialog";
import CrmStageWidget from "./crm-stage-widget";
import LabelsManager from "./labels-manager";
import TemplatesManager from "./templates-manager";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

// Types
interface Connection {
  id: string;
  instanceName: string;
  phoneNumber: string | null;
  status: string;
}

interface ConversationLabel {
  id: string;
  name: string;
  color: string;
}

interface CrmStageInfo {
  name: string;
  color: string;
}

interface Conversation {
  id: string;
  remotePhone: string;
  contactName: string | null;
  profilePictureUrl: string | null;
  contactPatientId: string | null;
  isRead: boolean;
  isArchived: boolean;
  unreadCount: number;
  lastMessageContent: string | null;
  lastMessageAt: string | null;
  lastMessageDirection: string | null;
  assignedToName: string | null;
  crmStage: CrmStageInfo | null;
  labels: ConversationLabel[];
}

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
  category: string | null;
}

interface QuickReply {
  id: string;
  shortcut: string;
  content: string;
}

interface Member {
  userId: string;
  name: string;
}

interface Message {
  id: string;
  direction: string;
  messageType: string;
  content: string | null;
  mediaUrl: string | null;
  status: string;
  createdAt: string;
  sentByUserName: string | null;
}

interface WhatsAppLayoutProps {
  connections: Connection[];
  conversations: Conversation[];
  labels: Label[];
  templates: Template[];
  quickReplies: QuickReply[];
  members: Member[];
  currentUserId: string;
  currentUserName: string;
}

export default function WhatsAppLayout({
  connections,
  conversations: initialConversations,
  labels,
  templates,
  quickReplies,
  currentUserName,
}: WhatsAppLayoutProps) {
  const router = useRouter();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [showLabelsManager, setShowLabelsManager] = useState(false);
  const [showTemplatesManager, setShowTemplatesManager] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [showNewConvDialog, setShowNewConvDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [instanceNameInput, setInstanceNameInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMessageCountRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mediaPreview, setMediaPreview] = useState<{
    base64: string;
    mimeType: string;
    mediaType: "image" | "audio" | "video" | "document";
    fileName: string;
    previewUrl: string;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const prevTotalUnreadRef = useRef(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeConnection = connections[0];
  const isConnected = activeConnection?.status === "connected";
  const [conversations, setConversations] = useState(initialConversations);

  // Keep conversations in sync with server data (from router.refresh)
  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  // Notification sound (Web Audio API beep)
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch {
      // Ignore if AudioContext is not supported
    }
  }, []);

  // Browser notification
  const showBrowserNotification = useCallback(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification("Nova mensagem", {
        body: "Voce recebeu uma nova mensagem no WhatsApp",
        icon: "/logoelo.png",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  // Detect new unread messages and trigger notifications
  useEffect(() => {
    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
    if (totalUnread > prevTotalUnreadRef.current && prevTotalUnreadRef.current >= 0) {
      playNotificationSound();
      showBrowserNotification();
    }
    prevTotalUnreadRef.current = totalUnread;
  }, [conversations, playNotificationSound, showBrowserNotification]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    if (filterTab === "unread" && conv.isRead) return false;
    if (filterTab === "archived" && !conv.isArchived) return false;
    if (filterTab !== "archived" && conv.isArchived) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = conv.contactName?.toLowerCase().includes(query);
      const phoneMatch = conv.remotePhone.includes(query);
      return nameMatch || phoneMatch;
    }
    return true;
  });

  // Fetch messages for selected conversation
  const loadMessages = useCallback(async () => {
    if (!selectedConv || !activeConnection) return;
    try {
      const result = await fetchWhatsappMessages({
        connectionId: activeConnection.id,
        remotePhone: selectedConv.remotePhone,
      });
      if (result?.data) {
        setMessages(result.data);
      }
    } catch {
      // Silent fail for polling
    }
  }, [selectedConv, activeConnection]);

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConvId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [selectedConvId, loadMessages]);

  // Poll for new messages and conversations every 5 seconds
  useEffect(() => {
    if (!activeConnection || !isConnected) return;
    pollRef.current = setInterval(() => {
      if (selectedConvId) {
        loadMessages();
      }
      router.refresh();
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedConvId, activeConnection, isConnected, loadMessages, router]);

  // Scroll to bottom only when new messages arrive (not on every poll re-render)
  useEffect(() => {
    const newCount = messages.length;
    const prevCount = prevMessageCountRef.current;
    prevMessageCountRef.current = newCount;

    // Skip if no messages or count didn't change (just a re-render)
    if (newCount === 0 || newCount === prevCount) return;

    const scrollEl = scrollAreaRef.current;
    if (scrollEl) {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isNearBottom || prevCount === 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: prevCount === 0 ? "instant" : "smooth" });
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  // Actions
  const createAction = useAction(createWhatsappInstance, {
    onSuccess: (result) => {
      if (result.data?.qrCode) {
        setQrCodeBase64(result.data.qrCode);
      }
      toast.success("Instancia criada! Escaneie o QR Code.");
    },
    onError: () => {
      toast.error("Erro ao criar instancia WhatsApp.");
    },
  });

  const checkStatusAction = useAction(checkWhatsappStatus, {
    onSuccess: (result) => {
      if (result.data?.status === "connected") {
        setShowQrDialog(false);
        setQrCodeBase64(null);
        toast.success("WhatsApp conectado com sucesso!");
        if (statusPollRef.current) clearInterval(statusPollRef.current);
        router.refresh();
      }
    },
  });

  const disconnectAction = useAction(disconnectWhatsapp, {
    onSuccess: () => {
      toast.success("WhatsApp desconectado.");
      router.refresh();
    },
  });

  const sendAction = useAction(sendWhatsappMessage, {
    onSuccess: () => {
      setMessageInput("");
      loadMessages();
      router.refresh();
    },
    onError: () => {
      toast.error("Erro ao enviar mensagem.");
    },
  });

  const sendMediaAction = useAction(sendWhatsappMedia, {
    onSuccess: () => {
      setMediaPreview(null);
      setMessageInput("");
      loadMessages();
      router.refresh();
    },
    onError: () => {
      toast.error("Erro ao enviar midia.");
    },
  });

  const toggleReadAction = useAction(toggleConversationRead);
  const toggleArchiveAction = useAction(toggleConversationArchive);
  const addLabelAction = useAction(addConversationLabel, {
    onSuccess: () => router.refresh(),
  });
  const removeLabelAction = useAction(removeConversationLabel, {
    onSuccess: () => router.refresh(),
  });

  // Start QR code polling when dialog opens
  useEffect(() => {
    if (showQrDialog && activeConnection) {
      statusPollRef.current = setInterval(() => {
        checkStatusAction.execute({ connectionId: activeConnection.id });
      }, 3000);
      return () => {
        if (statusPollRef.current) clearInterval(statusPollRef.current);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQrDialog, activeConnection]);

  const handleConnect = () => {
    if (!activeConnection) {
      // No connection yet, need to create one
      setShowQrDialog(true);
      return;
    }
    // Has connection, just get QR code
    setShowQrDialog(true);
    setQrCodeBase64(null);
    // Check current status first
    checkStatusAction.execute({ connectionId: activeConnection.id });
  };

  const handleCreateInstance = () => {
    if (!instanceNameInput.trim()) {
      toast.error("Digite um nome para a instancia.");
      return;
    }
    createAction.execute({ instanceName: instanceNameInput.trim() });
  };

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConv || !activeConnection) return;

    // Add signature if member
    let content = messageInput.trim();
    if (currentUserName) {
      content = `${content}\n\n_${currentUserName}_`;
    }

    sendAction.execute({
      connectionId: activeConnection.id,
      remotePhone: selectedConv.remotePhone,
      content,
    });
  };

  const handleNewConversation = () => {
    if (!newPhoneInput.trim() || !activeConnection) return;
    const phone = newPhoneInput.trim().replace(/\D/g, "");
    // Create a temporary conversation by sending a message
    setShowNewConvDialog(false);
    setSelectedConvId(null);
    // We'll set the phone and let the user type a message
    // For now, just find or navigate
    const existing = conversations.find((c) => c.remotePhone === phone);
    if (existing) {
      setSelectedConvId(existing.id);
    } else {
      // Send empty to create conversation
      toast.info(`Digite uma mensagem para ${phone}`);
    }
    setNewPhoneInput("");
  };

  const handleTemplateSelect = (content: string) => {
    setMessageInput(content);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 15MB limit
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Maximo 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 from data URI
      const base64 = result.split(",")[1];
      const mimeType = file.type;

      let mediaType: "image" | "audio" | "video" | "document" = "document";
      if (mimeType.startsWith("image/")) mediaType = "image";
      else if (mimeType.startsWith("audio/")) mediaType = "audio";
      else if (mimeType.startsWith("video/")) mediaType = "video";

      setMediaPreview({
        base64,
        mimeType,
        mediaType,
        fileName: file.name,
        previewUrl: result,
      });
    };
    reader.readAsDataURL(file);
    // Reset the input so the same file can be selected again
    e.target.value = "";
  };

  const handleSendMedia = () => {
    if (!mediaPreview || !selectedConv || !activeConnection) return;

    sendMediaAction.execute({
      connectionId: activeConnection.id,
      remotePhone: selectedConv.remotePhone,
      mediaBase64: mediaPreview.base64,
      mediaType: mediaPreview.mediaType,
      mimeType: mediaPreview.mimeType,
      fileName: mediaPreview.fileName,
      caption: messageInput.trim() || undefined,
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          setMediaPreview({
            base64,
            mimeType: "audio/webm",
            mediaType: "audio",
            fileName: "audio.webm",
            previewUrl: result,
          });
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Nao foi possivel acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    setIsRecording(false);
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    // Avoid hydration mismatch: return stable value until client-mounted
    if (!isMounted) return "";
    const date = dayjs(dateStr);
    const now = dayjs();
    if (now.diff(date, "day") === 0) return date.format("HH:mm");
    if (now.diff(date, "day") === 1) return "Ontem";
    if (now.diff(date, "day") < 7) return date.format("ddd");
    return date.format("DD/MM/YY");
  };

  // Format WhatsApp text: *bold*, _italic_, ~strikethrough~
  const formatWhatsAppText = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
      .replace(/_([^_]+)_/g, "<em>$1</em>")
      .replace(/~([^~]+)~/g, "<del>$1</del>");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-background px-6 py-3">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">WhatsApp</h1>
          {activeConnection && (
            <Badge
              variant={isConnected ? "default" : "destructive"}
              className="gap-1"
            >
              {isConnected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {isConnected ? "Conectado" : "Desconectado"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/whatsapp/contatos">
            <Button variant="outline" size="sm">
              <Users className="mr-1.5 h-4 w-4" />
              Contatos
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLabelsManager(true)}
          >
            <Tag className="mr-1.5 h-4 w-4" />
            Etiquetas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplatesManager(true)}
          >
            <Settings2 className="mr-1.5 h-4 w-4" />
            Templates
          </Button>
          <Link href="/whatsapp/configuracoes">
            <Button variant="outline" size="sm">
              <Settings2 className="mr-1.5 h-4 w-4" />
              Configurações
            </Button>
          </Link>
          {activeConnection && isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                disconnectAction.execute({
                  connectionId: activeConnection.id,
                })
              }
            >
              <Unplug className="mr-1.5 h-4 w-4" />
              Desconectar
            </Button>
          ) : (
            <Button size="sm" onClick={handleConnect}>
              <Smartphone className="mr-1.5 h-4 w-4" />
              Conectar WhatsApp
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Sidebar - Conversations */}
        <div className="flex w-[380px] min-h-0 flex-col border-r bg-background">
          {/* Search + New */}
          <div className="space-y-2 border-b p-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setShowNewConvDialog(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Tabs value={filterTab} onValueChange={setFilterTab}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1 text-xs">
                  Todas
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex-1 text-xs">
                  Nao lidas
                </TabsTrigger>
                <TabsTrigger value="archived" className="flex-1 text-xs">
                  Arquivadas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Conversation List */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Nenhuma conversa encontrada"
                    : filterTab === "unread"
                      ? "Nenhuma mensagem nao lida"
                      : filterTab === "archived"
                        ? "Nenhuma conversa arquivada"
                        : "Nenhuma conversa ainda"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`cursor-pointer border-b px-3 py-3 transition-colors hover:bg-muted/50 ${
                    selectedConvId === conv.id
                      ? "border-l-2 border-l-primary bg-primary/5"
                      : ""
                  } ${!conv.isRead ? "bg-primary/[0.02]" : ""}`}
                  onClick={() => setSelectedConvId(conv.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      {conv.profilePictureUrl && (
                        <AvatarImage src={conv.profilePictureUrl} alt={conv.contactName || conv.remotePhone} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {(conv.contactName || conv.remotePhone)[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p
                            className={`truncate text-sm ${!conv.isRead ? "font-bold" : "font-medium"}`}
                          >
                            {conv.contactName || formatPhone(conv.remotePhone)}
                          </p>
                          {conv.crmStage && (
                            <span
                              className="inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white"
                              style={{ backgroundColor: conv.crmStage.color }}
                              title={conv.crmStage.name}
                            >
                              {conv.crmStage.name}
                            </span>
                          )}
                        </div>
                        <span
                          className={`shrink-0 text-xs ${!conv.isRead ? "font-semibold text-primary" : "text-muted-foreground"}`}
                        >
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="truncate text-xs text-muted-foreground">
                          {conv.lastMessageDirection === "outbound" && (
                            <span className="mr-1 inline-flex">
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            </span>
                          )}
                          {conv.lastMessageContent || "Midia"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="ml-1 h-5 min-w-5 justify-center rounded-full bg-primary px-1.5 text-[10px]">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {conv.labels.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {conv.labels.map((label) => (
                            <span
                              key={label.id}
                              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                              style={{ backgroundColor: label.color }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex min-h-0 flex-1 flex-col bg-muted/20">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {selectedConv.profilePictureUrl && (
                      <AvatarImage src={selectedConv.profilePictureUrl} alt={selectedConv.contactName || selectedConv.remotePhone} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(
                        selectedConv.contactName || selectedConv.remotePhone
                      )[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">
                        {selectedConv.contactName ||
                          formatPhone(selectedConv.remotePhone)}
                      </p>
                      <CrmStageWidget phoneNumber={selectedConv.remotePhone} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedConv.remotePhone}
                      {selectedConv.assignedToName && (
                        <span className="ml-2">
                          · Atendido por {selectedConv.assignedToName}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Convert to Patient */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setShowConvertDialog(true)}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Converter Paciente</span>
                  </Button>
                  {/* Labels popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Tag className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-2">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Etiquetas
                      </p>
                      {labels.map((label) => {
                        const isAssigned = selectedConv.labels.some(
                          (l) => l.id === label.id,
                        );
                        return (
                          <button
                            key={label.id}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                            onClick={() => {
                              if (isAssigned) {
                                removeLabelAction.execute({
                                  conversationId: selectedConv.id,
                                  labelId: label.id,
                                });
                              } else {
                                addLabelAction.execute({
                                  conversationId: selectedConv.id,
                                  labelId: label.id,
                                });
                              }
                            }}
                          >
                            <Circle
                              className="h-3 w-3 shrink-0"
                              fill={label.color}
                              color={label.color}
                            />
                            <span className="flex-1 text-left">
                              {label.name}
                            </span>
                            {isAssigned && (
                              <Check className="h-3 w-3 text-primary" />
                            )}
                          </button>
                        );
                      })}
                      {labels.length === 0 && (
                        <p className="py-2 text-center text-xs text-muted-foreground">
                          Nenhuma etiqueta criada
                        </p>
                      )}
                    </PopoverContent>
                  </Popover>

                  {/* Actions menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          toggleReadAction.execute({
                            conversationId: selectedConv.id,
                            isRead: !selectedConv.isRead,
                          });
                          router.refresh();
                        }}
                      >
                        {selectedConv.isRead ? (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Marcar como nao lida
                          </>
                        ) : (
                          <>
                            <MailOpen className="mr-2 h-4 w-4" />
                            Marcar como lida
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          toggleArchiveAction.execute({
                            conversationId: selectedConv.id,
                            isArchived: !selectedConv.isArchived,
                          });
                          setSelectedConvId(null);
                          router.refresh();
                        }}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        {selectedConv.isArchived
                          ? "Desarquivar"
                          : "Arquivar conversa"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setSelectedConvId(null)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Fechar conversa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollAreaRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
                <div className="space-y-1">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <MessageCircle className="mb-3 h-12 w-12 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma mensagem ainda
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`relative max-w-[75%] rounded-lg px-3 py-1.5 ${
                            msg.direction === "outbound"
                              ? "rounded-br-sm bg-primary text-primary-foreground"
                              : "rounded-bl-sm bg-background shadow-sm"
                          }`}
                        >
                          {/* Media content */}
                          {msg.mediaUrl && msg.messageType === "image" && (
                            <div className="mb-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={msg.mediaUrl}
                                alt="Imagem"
                                className="max-h-64 rounded-md object-contain cursor-pointer"
                                onClick={() => setLightboxUrl(msg.mediaUrl)}
                              />
                            </div>
                          )}
                          {msg.mediaUrl && msg.messageType === "audio" && (
                            <div className="mb-1">
                              <audio controls className="max-w-[250px]" preload="none">
                                <source src={msg.mediaUrl} />
                              </audio>
                            </div>
                          )}
                          {msg.mediaUrl && msg.messageType === "video" && (
                            <div className="mb-1">
                              <video
                                controls
                                className="max-h-64 rounded-md"
                                preload="none"
                              >
                                <source src={msg.mediaUrl} />
                              </video>
                            </div>
                          )}
                          {msg.mediaUrl && msg.messageType === "document" && (
                            <a
                              href={msg.mediaUrl}
                              download={msg.content || "documento"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mb-1 flex items-center gap-2 rounded-md p-2 ${
                                msg.direction === "outbound"
                                  ? "bg-primary-foreground/10"
                                  : "bg-muted"
                              }`}
                            >
                              <File className="h-5 w-5 shrink-0" />
                              <span className="min-w-0 flex-1 truncate text-xs">
                                {msg.content || "Documento"}
                              </span>
                              <Download className="h-4 w-4 shrink-0" />
                            </a>
                          )}
                          {/* No media fallback for non-text types */}
                          {!msg.mediaUrl && msg.messageType !== "text" && (
                            <div className={`mb-1 flex items-center gap-2 rounded-md p-2 ${
                              msg.direction === "outbound"
                                ? "bg-primary-foreground/10"
                                : "bg-muted"
                            }`}>
                              {msg.messageType === "image" && <ImageIcon className="h-4 w-4" />}
                              {msg.messageType === "audio" && <Mic className="h-4 w-4" />}
                              {msg.messageType === "video" && <Video className="h-4 w-4" />}
                              {msg.messageType === "document" && <File className="h-4 w-4" />}
                              <span className="text-xs opacity-70">
                                {msg.messageType === "image" ? "Imagem" :
                                 msg.messageType === "audio" ? "Audio" :
                                 msg.messageType === "video" ? "Video" :
                                 "Documento"}
                              </span>
                            </div>
                          )}
                          {/* Text content (caption or message) */}
                          {msg.content && msg.messageType !== "document" && (
                            <p
                              className="whitespace-pre-wrap text-sm leading-snug"
                              dangerouslySetInnerHTML={{ __html: formatWhatsAppText(msg.content) }}
                            />
                          )}
                          {msg.messageType === "text" && !msg.content && (
                            <p className="whitespace-pre-wrap text-sm leading-snug">
                              {msg.content || ""}
                            </p>
                          )}
                          <div
                            className={`mt-0.5 flex items-center gap-1 ${
                              msg.direction === "outbound"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {msg.sentByUserName && (
                              <span className="text-[10px] opacity-70">
                                {msg.sentByUserName} ·
                              </span>
                            )}
                            <span className="text-[10px] opacity-70">
                              {dayjs(msg.createdAt).format("HH:mm")}
                            </span>
                            {msg.direction === "outbound" && (
                              <span className="opacity-70">
                                {msg.status === "read" ? (
                                  <CheckCheck className="h-3 w-3 text-blue-300" />
                                ) : msg.status === "delivered" ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : msg.status === "sent" ? (
                                  <Check className="h-3 w-3" />
                                ) : null}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t bg-background px-3 py-2">
                {/* Media Preview */}
                {mediaPreview && (
                  <div className="mb-2 flex items-start gap-2 rounded-md border bg-muted/50 p-2">
                    <div className="min-w-0 flex-1">
                      {mediaPreview.mediaType === "image" && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={mediaPreview.previewUrl}
                          alt="Preview"
                          className="max-h-32 rounded-md object-contain"
                        />
                      )}
                      {mediaPreview.mediaType === "audio" && (
                        <div className="flex items-center gap-2">
                          <Mic className="h-5 w-5 shrink-0 text-muted-foreground" />
                          <audio controls className="h-8 max-w-[200px]" preload="auto">
                            <source src={mediaPreview.previewUrl} />
                          </audio>
                        </div>
                      )}
                      {mediaPreview.mediaType === "video" && (
                        <div className="flex items-center gap-2">
                          <Video className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{mediaPreview.fileName}</span>
                        </div>
                      )}
                      {mediaPreview.mediaType === "document" && (
                        <div className="flex items-center gap-2">
                          <File className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{mediaPreview.fileName}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => setMediaPreview(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {/* Quick replies & Templates */}
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {quickReplies.slice(0, 5).map((qr) => (
                    <Button
                      key={qr.id}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setMessageInput(qr.content)}
                    >
                      /{qr.shortcut}
                    </Button>
                  ))}
                  {templates.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                        >
                          Templates
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-64 p-2">
                        {templates.map((t) => (
                          <button
                            key={t.id}
                            className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                            onClick={() => handleTemplateSelect(t.content)}
                          >
                            <p className="font-medium">{t.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {t.content}
                            </p>
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <div className="flex gap-2">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                    onChange={handleFileSelect}
                  />
                  {isRecording ? (
                    /* Recording UI */
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 shrink-0"
                        onClick={cancelRecording}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-md border border-destructive/50 bg-destructive/5 px-3">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                        <span className="text-sm text-destructive">Gravando audio...</span>
                      </div>
                      <Button
                        onClick={stopRecording}
                        size="icon"
                        className="h-11 w-11 shrink-0"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    /* Normal input UI */
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Textarea
                        placeholder={mediaPreview ? "Legenda (opcional)..." : "Digite uma mensagem..."}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (mediaPreview) {
                              handleSendMedia();
                            } else {
                              handleSend();
                            }
                          }
                        }}
                        className="min-h-[44px] max-h-32 resize-none"
                        rows={1}
                      />
                      {/* Show mic button when no text input and no media preview */}
                      {!messageInput.trim() && !mediaPreview ? (
                        <Button
                          onClick={startRecording}
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 shrink-0"
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={mediaPreview ? handleSendMedia : handleSend}
                          disabled={
                            (mediaPreview ? sendMediaAction.isPending : sendAction.isPending) ||
                            (!mediaPreview && !messageInput.trim())
                          }
                          size="icon"
                          className="h-11 w-11 shrink-0"
                        >
                          {(sendAction.isPending || sendMediaAction.isPending) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-6">
                <MessageCircle className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                Clinpro WhatsApp
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {!activeConnection
                  ? "Conecte seu WhatsApp para comecar a receber e enviar mensagens."
                  : !isConnected
                    ? "Seu WhatsApp esta desconectado. Clique em Conectar para reconectar."
                    : "Selecione uma conversa ao lado ou inicie uma nova conversa."}
              </p>
              {!activeConnection && (
                <Button className="mt-4" onClick={handleConnect}>
                  <Smartphone className="mr-2 h-4 w-4" />
                  Conectar WhatsApp
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Conectar WhatsApp
            </DialogTitle>
            <DialogDescription>
              {!activeConnection
                ? "Crie uma instancia e escaneie o QR Code com seu WhatsApp."
                : "Escaneie o QR Code com seu WhatsApp para conectar."}
            </DialogDescription>
          </DialogHeader>

          {!activeConnection ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nome da Instancia
                </label>
                <Input
                  placeholder="Ex: minha-clinica"
                  value={instanceNameInput}
                  onChange={(e) =>
                    setInstanceNameInput(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    )
                  }
                />
              </div>
              <Button
                onClick={handleCreateInstance}
                disabled={createAction.isPending}
                className="w-full"
              >
                {createAction.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Criar e Conectar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {qrCodeBase64 ? (
                <>
                  <div className="overflow-hidden rounded-xl border bg-white p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeBase64}
                      alt="QR Code"
                      className="h-64 w-64"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Aguardando leitura do QR Code...
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {isConnected
                      ? "WhatsApp ja esta conectado!"
                      : "Gerando QR Code..."}
                  </p>
                  {!isConnected && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const { getWhatsappQrCode } = await import(
                            "@/actions/get-whatsapp-qrcode"
                          );
                          const result = await getWhatsappQrCode({
                            connectionId: activeConnection.id,
                          });
                          if (result?.data?.qrCode) {
                            setQrCodeBase64(result.data.qrCode);
                          }
                        } catch {
                          toast.error("Erro ao gerar QR Code.");
                        }
                      }}
                    >
                      Gerar QR Code
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConvDialog} onOpenChange={setShowNewConvDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova Conversa</DialogTitle>
            <DialogDescription>
              Digite o numero de telefone para iniciar uma conversa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="5511999999999"
              value={newPhoneInput}
              onChange={(e) => setNewPhoneInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNewConversation()}
            />
            <Button onClick={handleNewConversation} className="w-full">
              Iniciar Conversa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert Contact Dialog */}
      {selectedConv && (
        <ConvertContactDialog
          open={showConvertDialog}
          onOpenChange={setShowConvertDialog}
          contactName={selectedConv.contactName}
          phoneNumber={selectedConv.remotePhone}
        />
      )}

      {/* Labels Manager Dialog */}
      <LabelsManager
        open={showLabelsManager}
        onOpenChange={setShowLabelsManager}
        labels={labels}
      />

      {/* Templates Manager Dialog */}
      <TemplatesManager
        open={showTemplatesManager}
        onOpenChange={setShowTemplatesManager}
        templates={templates}
      />

      {/* Image Lightbox */}
      <Dialog
        open={!!lightboxUrl}
        onOpenChange={(open) => !open && setLightboxUrl(null)}
      >
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Imagem ampliada</DialogTitle>
          {lightboxUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={lightboxUrl}
              alt="Imagem ampliada"
              className="max-h-[85vh] w-auto rounded-lg object-contain"
              onClick={() => setLightboxUrl(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatPhone(phone: string): string {
  if (phone.length === 13) {
    return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
  }
  if (phone.length === 12) {
    return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 8)}-${phone.slice(8)}`;
  }
  return phone;
}
