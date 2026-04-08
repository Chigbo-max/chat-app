// src/components/Chat/ChatWindow.tsx

import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Settings, Smile, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import GroupManagementModal from "./GroupManagementModal";
import {
  GET_MESSAGES,
  SEND_MESSAGE_MUTATION,
  GET_CONVERSATION,
  GET_USER_CONVERSATIONS,
  ADD_REACTION_MUTATION,
  REMOVE_REACTION_MUTATION,
  EDIT_MESSAGE_MUTATION,
  DELETE_MESSAGE_MUTATION,
  MARK_MESSAGE_READ_MUTATION,
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
  readBy: string[];
  edited: boolean;
  deleted: boolean;
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

interface AddReactionResponse {
  addReaction: {
    id: string;
    reactions: { user: string; emoji: string }[];
  };
}

interface RemoveReactionResponse {
  removeReaction: {
    id: string;
    reactions: { user: string; emoji: string }[];
  };
}

interface EditMessageData {
  editMessage: {
    id: string;
    content: string;
  }
}

interface DeleteMessageData {
  deleteMessage: {
    id: string;
    content: string;
  }
}

interface MarkMessageReadData {
  markMessageRead: {
    id: string;
    readBy: string[];
    status: string;
  }
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
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<string | null>(null);
  const [messageMenuOpen, setMessageMenuOpen] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const isNewContactConversation = conversationId?.startsWith("user-");

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerOpen &&
        !(event.target as Element).closest(".emoji-picker")
      ) {
        setEmojiPickerOpen(null);
      }
      if (
        messageMenuOpen &&
        !(event.target as Element).closest(".message-menu")
      ) {
        setMessageMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [emojiPickerOpen, messageMenuOpen]);

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

  const [sendMessage, { loading: isSending }] = useMutation<{
    sendMessage: Message;
  }>(SEND_MESSAGE_MUTATION, {
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
        const existingConversations =
          cache.readQuery<GetUserConversationsCache>({
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
              },
            );

          // ✅ Move updated conversation to top
          updated = updated.sort(
            (a, b) =>
              new Date(b.lastMessageAt || 0).getTime() -
              new Date(a.lastMessageAt || 0).getTime(),
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

  const [addReaction] = useMutation<AddReactionResponse>(
    ADD_REACTION_MUTATION,
    {
      update(cache, { data }) {
        if (!data?.addReaction) return;

        // Update the message in cache
        try {
          const existingMessages = cache.readQuery<{
            getMessages: { messages: Message[] };
          }>({
            query: GET_MESSAGES,
            variables: { conversationId, limit: 100 },
          });

          if (existingMessages?.getMessages?.messages) {
            const updatedMessages = existingMessages.getMessages.messages.map(
              (msg) =>
                msg.id === data.addReaction.id
                  ? { ...msg, reactions: data.addReaction.reactions }
                  : msg,
            );

            cache.writeQuery({
              query: GET_MESSAGES,
              variables: { conversationId, limit: 100 },
              data: {
                getMessages: {
                  ...existingMessages.getMessages,
                  messages: updatedMessages,
                },
              },
            });
          }
        } catch {
          // ignore cache errors
        }
      },
    },
  );

  const [removeReaction] = useMutation<RemoveReactionResponse>(
    REMOVE_REACTION_MUTATION,
    {
      update(cache, { data }) {
        if (!data?.removeReaction) return;

        // Update the message in cache
        try {
          const existingMessages = cache.readQuery<{
            getMessages: { messages: Message[] };
          }>({
            query: GET_MESSAGES,
            variables: { conversationId, limit: 100 },
          });

          if (existingMessages?.getMessages?.messages) {
            const updatedMessages = existingMessages.getMessages.messages.map(
              (msg) =>
                msg.id === data.removeReaction.id
                  ? { ...msg, reactions: data.removeReaction.reactions }
                  : msg,
            );

            cache.writeQuery({
              query: GET_MESSAGES,
              variables: { conversationId, limit: 100 },
              data: {
                getMessages: {
                  ...existingMessages.getMessages,
                  messages: updatedMessages,
                },
              },
            });
          }
        } catch {
          // ignore cache errors
        }
      },
    },
  );

  const [editMessage] = useMutation<EditMessageData>(EDIT_MESSAGE_MUTATION, {
    update(cache, { data }) {
      const updated = data?.editMessage;
      if (!updated) return;
      try {
        const existing = cache.readQuery<{
          getMessages: { messages: Message[] };
        }>({
          query: GET_MESSAGES,
          variables: { conversationId, limit: 100 },
        });
        if (existing?.getMessages?.messages) {
          const messages = existing.getMessages.messages.map((m) =>
            m.id === updated.id
              ? {
                  ...m,
                  content: updated.content,
                  __typename: "Message",
                }
              : m,
          );
          cache.writeQuery({
            query: GET_MESSAGES,
            variables: { conversationId, limit: 100 },
            data: { getMessages: { ...existing.getMessages, messages } },
          });
        }
      } catch {
        return "";
      }
    },
    onCompleted() {
      setEditOpen(false);
      setEditMessageId(null);
      setEditContent("");
    },
  });

  const [deleteMessage] = useMutation<DeleteMessageData>(DELETE_MESSAGE_MUTATION, {
    update(cache, { data }) {
      const updated = data?.deleteMessage;
      if (!updated) return;
      try {
        const existing = cache.readQuery<{
          getMessages: { messages: Message[] };
        }>({
          query: GET_MESSAGES,
          variables: { conversationId, limit: 100 },
        });
        if (existing?.getMessages?.messages) {
          const messages = existing.getMessages.messages.map((m) =>
            m.id === updated.id
              ? {
                  ...m,
                  content: updated.content ?? "",
                  __typename: "Message",
                }
              : m,
          );
          cache.writeQuery({
            query: GET_MESSAGES,
            variables: { conversationId, limit: 100 },
            data: { getMessages: { ...existing.getMessages, messages } },
          });
        }
      } catch {
        return "";
      }
    },
  });

  const [markMessageRead] = useMutation<MarkMessageReadData>(MARK_MESSAGE_READ_MUTATION, {
    update(cache, { data }) {
      const updated = data?.markMessageRead;
      if (!updated) return;
      try {
        const existing = cache.readQuery<{
          getMessages: { messages: Message[] };
        }>({
          query: GET_MESSAGES,
          variables: { conversationId, limit: 100 },
        });
        if (existing?.getMessages?.messages) {
          const messages = existing.getMessages.messages.map((m) =>
            m.id === updated.id
              ? {
                  ...m,
                  readBy: updated.readBy,
                  status: updated.status,
                  __typename: "Message",
                }
              : m,
          );
          cache.writeQuery({
            query: GET_MESSAGES,
            variables: { conversationId, limit: 100 },
            data: { getMessages: { ...existing.getMessages, messages } },
          });
        }
      } catch {
        return "";
}
    },
  });

  const { data: conversationData } = useQuery<GetConversationData>(
    GET_CONVERSATION,
    {
      variables: { id: conversationId! },
      skip: !conversationId || isNewContactConversation,
    },
  );

  const { data: userConversationsData } = useQuery<GetUserConversationsData>(
    GET_USER_CONVERSATIONS,
    {
      variables: { limit: 30 },
      fetchPolicy: "cache-first",
    },
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

  const handleSend = async (event: React.SyntheticEvent<HTMLFormElement>) => {
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
          readBy: [],
          edited: false,
          deleted: false,
          __typename: "Message",
        },
      },
    });

    if (isNewContactConversation && result?.data?.sendMessage?.conversationId) {
      onConversationCreated?.(result.data.sendMessage.conversationId);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    await addReaction({
      variables: { messageId, emoji },
    });
  };

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    await removeReaction({
      variables: { messageId, emoji },
    });
  };

  const selectedName = useMemo(() => {
    if (isGroup) return conversationData?.getConversation?.name || "Group Chat";
    
    // For 1-1 chats, find the other participant
    const otherParticipant = participants.find((p) => p.id !== currentUser?.id);
    return otherParticipant?.username || "Chat";
  }, [isGroup, conversationData, participants, currentUser]);

  const otherParticipantStatus = useMemo(() => {
    if (isGroup || !conversationId) return "";
    
    // For 1-1, find the other participant's status
    // Note: We might need to fetch the actual status from the user data if it's not in the conversation object
    // For now, let's assume "Online" or "Offline" based on basic presence if available
    return "Online"; // Placeholder - would ideally come from presence subscription
  }, [isGroup, conversationId]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-card z-10 shadow-sm">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-muted text-muted-foreground text-lg">
            {selectedName?.[0] || "C"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[15px] leading-tight truncate">
            {selectedName}
          </p>
          <p className="text-[12px] text-muted-foreground leading-tight truncate">
            {conversationId
              ? isGroup
                ? `${participants.length} members`
                : otherParticipantStatus
              : "Select a conversation"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Button for Groups */}
          {isGroup && isCurrentUserAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsGroupManagementOpen(true)}
              className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted/50"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted/50"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 chat-bg relative">
        <div className="relative p-4 md:px-10 lg:px-20 min-h-full flex flex-col justify-end">
          {loading && (
            <div className="flex justify-center p-4">
              <p className="text-[13px] bg-card px-3 py-1 rounded-md shadow-sm text-muted-foreground">
                Loading messages...
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            {messages.map((msg, index) => {
              const isMe = msg.sender?.id === currentUser?.id;
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const isSameSender = prevMsg?.sender?.id === msg.sender?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex w-full mb-0.5 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[85%] sm:max-w-[70%] px-2.5 py-1.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] transition-all ${
                      isMe
                        ? "bg-[#dcf8c6] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-lg rounded-tr-none"
                        : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-lg rounded-tl-none"
                    } ${!isSameSender ? "mt-2" : "mt-0"}`}
                  >
                    {!isMe && isGroup && !isSameSender && (
                      <p className="text-[12.5px] font-bold text-primary mb-0.5 px-0.5">
                        {msg.sender?.username}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-end gap-x-2 px-0.5">
                      <p className="text-[14.2px] leading-normal wrap-break-word whitespace-pre-wrap flex-1 min-w-[60px]">
                        {msg.content && msg.content.trim().length > 0
                          ? msg.content
                          : "[message deleted]"}
                      </p>
                      
                      <div className="flex items-center gap-1 self-end mb-[-2px]">
                        {msg.edited && (
                          <span className="text-[10px] opacity-60 italic">
                            edited
                          </span>
                        )}
                        <span className="text-[11px] opacity-60 font-normal min-w-max">
                          {formatTime(msg.createdAt)}
                        </span>
                        {isMe && (
                          <span className="text-[14px] leading-none opacity-60 text-blue-400">
                            {msg.status === "sending" ? "..." : "✓✓"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 px-0.5">
                        {Object.entries(
                          msg.reactions.reduce(
                            (acc, reaction) => {
                              if (!acc[reaction.emoji]) {
                                acc[reaction.emoji] = { count: 0, users: [] };
                              }
                              acc[reaction.emoji].count++;
                              acc[reaction.emoji].users.push(reaction.user);
                              return acc;
                            },
                            {} as Record<
                              string,
                              { count: number; users: string[] }
                            >,
                          ),
                        ).map(([emoji, data]) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              if (data.users.includes(currentUser?.id || "")) {
                                handleRemoveReaction(msg.id, emoji);
                              } else {
                                handleAddReaction(msg.id, emoji);
                              }
                            }}
                            className={`px-1.5 py-0.5 rounded-full text-[11px] border bg-white/20 dark:bg-black/20 transition-colors ${
                              data.users.includes(currentUser?.id || "")
                                ? "border-primary/50 text-primary font-bold"
                                : "border-transparent hover:bg-black/10"
                            }`}
                          >
                            {emoji} {data.count}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Options Toggle - Only show on hover or click */}
                    <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          setMessageMenuOpen(
                            messageMenuOpen === msg.id ? null : msg.id,
                          )
                        }
                        className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </div>

                    {/* Emoji Picker Button - Only visible when menu open or hovered */}
                    <button
                      onClick={() =>
                        setEmojiPickerOpen(
                          emojiPickerOpen === msg.id ? null : msg.id,
                        )
                      }
                      className="absolute top-1 right-6 opacity-0 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <Smile className="w-3.5 h-3.5 opacity-50" />
                    </button>

                    {/* Emoji Picker Downwards */}
                    {emojiPickerOpen === msg.id && (
                      <div
                        className={`emoji-picker absolute top-full mt-1 ${
                          isMe ? "right-0" : "left-0"
                        } bg-card border border-border rounded-lg p-2 shadow-xl z-20 w-64 max-h-48 overflow-y-auto`}
                      >
                        <div className="grid grid-cols-6 gap-1.5">
                          {[
                            "👍", "❤️", "😂", "😮", "😢", "😡",
                            "🎉", "🔥", "👏", "🙏", "😍", "😎",
                            "😅", "😆", "😇", "🙂", "", "😌",
                          ].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                handleAddReaction(msg.id, emoji);
                                setEmojiPickerOpen(null);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted active:scale-95 transition text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Options Menu */}
                    {messageMenuOpen === msg.id && (
                      <div
                        className={`message-menu absolute top-full mt-1 ${
                          isMe ? "right-0" : "left-0"
                        } bg-card border border-border rounded-md py-1 shadow-xl z-20 w-36 overflow-hidden`}
                      >
                        {isMe && (
                          <button
                            onClick={() => {
                              setEditMessageId(msg.id);
                              setEditContent(msg.content || "");
                              setEditOpen(true);
                              setMessageMenuOpen(null);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted text-[13px] transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {isMe && (
                          <button
                            onClick={() => {
                              deleteMessage({
                                variables: { messageId: msg.id },
                              });
                              setMessageMenuOpen(null);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted text-[13px] text-red-500 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                        {!isMe && !msg.readBy.includes(currentUser?.id) && (
                          <button
                            onClick={() => {
                              markMessageRead({
                                variables: { messageId: msg.id },
                              });
                              setMessageMenuOpen(null);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted text-[13px] transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="px-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33] flex gap-2 items-center z-10"
      >
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground h-10 w-10"
          >
            <Smile className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg px-3 py-1 shadow-sm">
          <Input
            placeholder="Type a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!conversationId}
            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] h-9 p-0"
          />
        </div>

        <Button
          type="submit"
          disabled={!conversationId || isSending || !text.trim()}
          size="icon"
          className="h-10 w-10 rounded-full bg-wa-green hover:bg-[#008f6f] text-white shrink-0 shadow-sm"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>

      {/* Group Management Modal */}
      {conversationId && (
        <GroupManagementModal
          isOpen={isGroupManagementOpen}
          onOpenChange={setIsGroupManagementOpen}
          conversationId={conversationId}
          currentUser={currentUser}
          allUsers={allUsers}
        />
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Update message"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!editMessageId) return;
                const content = editContent.trim();
                if (!content) return;
                editMessage({
                  variables: {
                    input: { messageId: editMessageId, content },
                  },
                });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
