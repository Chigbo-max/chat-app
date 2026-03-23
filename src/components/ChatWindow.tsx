// src/components/Chat/ChatWindow.tsx

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Settings } from "lucide-react";
import GroupManagementModal from "./GroupManagementModal";
import {
  GET_MESSAGES,
  SEND_MESSAGE_MUTATION,
  GET_CONVERSATION,
  GET_USER_CONVERSATIONS,
} from "@/graphql/queries";

interface ChatWindowProps {
  conversationId?: string;
  onConversationCreated?: (conversationId: string) => void;
}

interface Participant {
  id: string;
  username: string;
  avatar?: string;
}

interface Conversation {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: Participant[];
  admins: string[];
}

interface GetConversationData {
  getConversation: Conversation;
}

interface GetUserConversationsData {
  getUserConversations: {
    conversations: Conversation[];
    nextCursor?: string;
    hasNextPage: boolean;
  };
  getAllUsers: Participant[];
}

interface Message {
  id: string;
  conversationId: string;
  content?: string;
  mediaUrl?: string;
  sender: Participant;
  reactions: { user: string; emoji: string }[];
  createdAt: string;
  status: string;
  __typename?: string;
}

interface GetUserConversationsCache {
  getUserConversations: {
    conversations: {
      id: string;
      lastMessage?: {
        id: string;
        content?: string;
        sender: Participant;
        createdAt: string;
        __typename?: string;
      } | null;
      lastMessageAt?: string;
    }[];
  };
}

const formatTime = (isoDate: string) => {
  try {
    return new Date(isoDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

export default function ChatWindow({
  conversationId,
  onConversationCreated,
}: ChatWindowProps) {
  const [text, setText] = useState("");
  const [isGroupManagementOpen, setIsGroupManagementOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const isNewContactConversation = conversationId?.startsWith("user-");

  const { data, loading, error } = useQuery<{
    getMessages: { messages: Message[] };
  }>(GET_MESSAGES, {
    variables: {
      conversationId,
      limit: 100,
    },
    skip: !conversationId || isNewContactConversation,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const [sendMessage, { loading: isSending }] = useMutation<
    { sendMessage: Message }
  >(SEND_MESSAGE_MUTATION, {
    update(cache, { data }) {
      if (!data?.sendMessage) return;

      const newMessage = data.sendMessage;

      // ✅ 1. Update messages cache
      try {
        const existingMessages = cache.readQuery<{
          getMessages: { messages: Message[] };
        }>({
          query: GET_MESSAGES,
          variables: { conversationId, limit: 100 },
        });

        if (existingMessages?.getMessages?.messages) {
          cache.writeQuery({
            query: GET_MESSAGES,
            variables: { conversationId, limit: 100 },
            data: {
              getMessages: {
                ...existingMessages.getMessages,
                messages: [
                  newMessage,
                  ...existingMessages.getMessages.messages,
                ],
              },
            },
          });
        }
      } catch {
        // ignore cache errors safely
      }

      // 🔥 2. Update sidebar (THIS FIXES YOUR ISSUE)
      try {
        const existingConversations = cache.readQuery<GetUserConversationsCache>({
          query: GET_USER_CONVERSATIONS,
          variables: { limit: 30 },
        });

        if (existingConversations?.getUserConversations?.conversations) {
          let updated =
            existingConversations.getUserConversations.conversations.map(
              (conv) => {
                if (conv.id === newMessage.conversationId) {
                  return {
                    ...conv,
                    lastMessage: {
                      id: newMessage.id,
                      content: newMessage.content,
                      sender: newMessage.sender,
                      createdAt: newMessage.createdAt,
                      __typename: "LastMessage",
                    },
                    lastMessageAt: newMessage.createdAt,
                  };
                }
                return conv;
              }
            );

          // ✅ Move updated conversation to top
          updated = updated.sort(
            (a, b) =>
              new Date(b.lastMessageAt || 0).getTime() -
              new Date(a.lastMessageAt || 0).getTime()
          );

          cache.writeQuery({
            query: GET_USER_CONVERSATIONS,
            variables: { limit: 30 },
            data: {
              ...existingConversations,
              getUserConversations: {
                ...existingConversations.getUserConversations,
                conversations: updated,
              },
            },
          });
        }
      } catch {
        // ignore safely
      }
    },

    onCompleted: () => {
      setText("");
    },

    onError: (err) => {
      console.error("SendMessage failed", err);
    },
  });

  const { data: conversationData } = useQuery<GetConversationData>(
    GET_CONVERSATION,
    {
      variables: { id: conversationId! },
      skip: !conversationId || isNewContactConversation,
    }
  );

  const { data: userConversationsData } = useQuery<GetUserConversationsData>(
    GET_USER_CONVERSATIONS,
    {
      variables: { limit: 30 },
      fetchPolicy: "cache-first",
    }
  );

  const isGroup = conversationData?.getConversation?.isGroup;
  const participants = conversationData?.getConversation?.participants || [];
  const admins = conversationData?.getConversation?.admins || [];
  const isCurrentUserAdmin = currentUser && admins.includes(currentUser.id);
  const allUsers = userConversationsData?.getAllUsers || [];

  const messages = useMemo(() => {
    const msgs = data?.getMessages?.messages || [];
    return [...msgs].reverse();
  }, [data]);

  const handleSend = async (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!conversationId) return;

    const body = text.trim();
    if (!body) return;

    const isNewContactConversation = conversationId.startsWith("user-");
    const recipientId = isNewContactConversation
      ? conversationId.replace(/^user-/, "")
      : undefined;

    const inputPayload = isNewContactConversation
      ? { recipientId, content: body }
      : { conversationId, content: body };

    const result = await sendMessage({
      variables: {
        input: inputPayload,
      },
      optimisticResponse: {
        sendMessage: {
          id: "temp-" + Date.now(),
          conversationId: conversationId.startsWith("user-")
            ? "temp-conv"
            : conversationId,
          content: body,
          createdAt: new Date().toISOString(),
          status: "sending",
          sender: currentUser,
          reactions: [],
          __typename: "Message",
        },
      },
    });

    if (
      isNewContactConversation &&
      result?.data?.sendMessage?.conversationId
    ) {
      onConversationCreated?.(
        result.data.sendMessage.conversationId
      );
    }
  };

  const selectedName =
    conversationData?.getConversation?.name ||
    data?.getMessages?.messages[0]?.sender?.username ||
    "Chat";

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        <Avatar>
          <AvatarFallback>
            {selectedName?.[0] || "C"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{selectedName}</p>
          <p className="text-xs text-muted-foreground">
            {conversationId
              ? isGroup
                ? `${participants.length} members${isCurrentUserAdmin ? " • Admin" : ""}`
                : "Online"
              : "Select a conversation"
            }
          </p>
        </div>

        {/* Group Participants */}
        {isGroup && participants.length > 0 && (
          <div className="flex -space-x-2">
            {participants.slice(0, 3).map((participant) => (
              <Avatar key={participant.id} className="w-8 h-8 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {participant.username[0]}
                </AvatarFallback>
              </Avatar>
            ))}
            {participants.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                +{participants.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Settings Button for Groups */}
        {isGroup && isCurrentUserAdmin && (
          <Button
            size="sm"
            onClick={() => setIsGroupManagementOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        {loading && (
          <p className="text-muted-foreground">
            Loading messages...
          </p>
        )}
        {error && (
          <p className="text-destructive">{error.message}</p>
        )}

        <div className="flex flex-col gap-2">
          {messages.map((msg) => {
            const isMe = msg.sender?.id === currentUser?.id;

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border"
                  }`}
                >
                  <p>{msg.content || "[media]"}</p>

                  <div className="flex items-center justify-between text-[10px] mt-1 opacity-80">
                    <span>{formatTime(msg.createdAt)}</span>
                    <span>
                      {msg.status === "sending"
                        ? "Sending..."
                        : msg.status || "sent"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t bg-card flex gap-2 items-center"
      >
        <Input
          placeholder={
            conversationId
              ? "Type a message..."
              : "Select a chat to send messages"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!conversationId}
        />

        <Button
          type="submit"
          disabled={!conversationId || isSending || !text.trim()}
        >
          <Send className="mr-1 h-4 w-4" />
          {isSending ? "Sending..." : "Send"}
        </Button>
      </form>

      {/* Group Management Modal */}
      {conversationId && conversationData && (
        <GroupManagementModal
          isOpen={isGroupManagementOpen}
          onOpenChange={setIsGroupManagementOpen}
          conversation={conversationData.getConversation || null}
          currentUser={currentUser}
          allUsers={allUsers}
        />
      )}
    </div>
  );
}