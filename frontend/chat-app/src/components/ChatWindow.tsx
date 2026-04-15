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
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        <Avatar>
          <AvatarFallback>{selectedName?.[0] || "C"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{selectedName}</p>
          <p className="text-xs text-muted-foreground">
            {conversationId
              ? isGroup
                ? `${participants.length} members${isCurrentUserAdmin ? " • Admin" : ""}`
                : otherParticipantStatus
              : "Select a conversation"}
          </p>
        </div>

        {/* Group Participants */}
        {isGroup && participants.length > 0 && (
          <div className="flex -space-x-2">
            {participants.slice(0, 3).map((participant) => (
              <Avatar
                key={participant.id}
                className="w-8 h-8 border-2 border-background"
              >
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
      <ScrollArea className="flex-1 overflow-y-auto chat-bg relative">
        <div className="absolute inset-0 bg-background/50 dark:bg-background/80 pointer-events-none" />
        <div className="relative p-4">
          {loading && (
            <p className="text-muted-foreground">Loading messages...</p>
          )}
          {error && <p className="text-destructive">{error.message}</p>}

          <div className="flex flex-col gap-2">
            {messages.map((msg) => {
              const isMe = msg.sender?.id === currentUser?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-md transition-colors ${
                      isMe
                        ? "bg-slate-900 text-white dark:bg-white dark:text-black rounded-tr-none"
                        : "bg-slate-800 text-white dark:bg-slate-200 dark:text-black rounded-tl-none"
                    }`}
                  >
                    <p className="font-medium">
                      {msg.content && msg.content.trim().length > 0
                        ? msg.content
                        : "[message deleted]"}
                    </p>
                    {msg.edited && (
                      <span className="mt-1 text-[10px] opacity-60 italic block">
                        edited
                      </span>
                    )}

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
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
                            className={`px-2 py-1 rounded-full text-[11px] border transition-colors ${
                              data.users.includes(currentUser?.id || "")
                                ? "bg-primary/20 border-primary text-primary"
                                : "bg-muted/30 border-border hover:bg-muted"
                            }`}
                          >
                            {emoji} {data.count}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Emoji Picker Toggle */}
                    <div className="flex items-center justify-between text-[10px] mt-2 opacity-70">
                      <span>{formatTime(msg.createdAt)}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setEmojiPickerOpen(
                              emojiPickerOpen === msg.id ? null : msg.id,
                            )
                          }
                          className="p-1 hover:bg-black/10 dark:hover:bg-black/5 rounded transition-colors"
                          title="Add reaction"
                        >
                          <Smile className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() =>
                            setMessageMenuOpen(
                              messageMenuOpen === msg.id ? null : msg.id,
                            )
                          }
                          className="p-1 hover:bg-black/10 dark:hover:bg-black/5 rounded transition-colors"
                          title="More"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>
                        <span className="ml-2 font-medium">
                          {msg.status === "sending"
                            ? "Sending..."
                            : msg.status || "sent"}
                        </span>
                      </div>
                    </div>

                    {/* Emoji Picker */}
                    {emojiPickerOpen === msg.id && (
                      <div
                        className={`emoji-picker absolute top-full mt-2 ${
                          isMe ? "left-0" : "right-0"
                        } bg-card border border-border rounded-xl p-3 shadow-xl z-10 w-64 max-h-48 overflow-y-auto`}
                      >
                        <div className="grid grid-cols-6 gap-2">
                          {[
                            "👍",
                            "❤️",
                            "😂",
                            "😮",
                            "😢",
                            "😡",
                            "🎉",
                            "💐",
                            "🔥",
                            "👏",
                            "🤔",
                            "😴",
                            "🙏",
                            "😍",
                            "🤗",
                            "🤩",
                            "🥳",
                            "😎",
                            "🤯",
                            "😅",
                            "😆",
                            "😇",
                            "🙂",
                            "🙃",
                            "😉",
                            "😌",
                            "😋",
                            "😜",
                            "🤪",
                            "😝",
                            "🤑",
                            "🤠",
                            "😏",
                            "😒",
                            "🙄",
                            "😬",
                            "🤥",
                          ].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                handleAddReaction(msg.id, emoji);
                                setEmojiPickerOpen(null);
                              }}
                              className="w-10 h-10 flex items-center justify-center rounded-lg text-xl hover:bg-muted active:scale-95 transition"
                              title={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messageMenuOpen === msg.id && (
                      <div
                        className={`message-menu absolute bottom-full mb-2 ${
                          isMe ? "left-0" : "right-0"
                        } bg-card border border-border rounded-xl p-2 shadow-xl z-10 w-40 opacity-100 backdrop-blur-none`}
                      >
                        {isMe && (
                          <button
                            onClick={() => {
                              setEditMessageId(msg.id);
                              setEditContent(msg.content || "");
                              setEditOpen(true);
                              setMessageMenuOpen(null);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm bg-card"
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
                            className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm text-red-600 bg-card"
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
                            className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm bg-card"
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