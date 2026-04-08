// src/components/Chat/Sidebar.tsx

import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LogOut, MoreVertical, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import GroupCreationModal from "./GroupCreationModal";
import {
  GET_USER_CONVERSATIONS,
  CREATE_CONVERSATION_MUTATION,
  EDIT_CONVERSATION_MUTATION,
  DELETE_CONVERSATION_MUTATION,
  MARK_CONVERSATION_READ_MUTATION,
} from "@/graphql/queries";

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
  unreadCounts?: any;
  lastMessage?: {
    id: string;
    content?: string;
    sender: Participant;
    createdAt: string;
  } | null;
  lastMessageAt?: string;
  createdAt?: string;
}

interface SidebarProps {
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}

interface GetUserConversationsData {
  getUserConversations: {
    conversations: Conversation[];
    nextCursor?: string;
    hasNextPage: boolean;
  };
  getAllUsers: Participant[];
}

interface CreateConversationData {
  createConversation: Conversation;
}

interface DeleteConversationData {
  deleteConversation: string;
}

export default function Sidebar({
  selectedConversationId,
  onSelectConversation,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [convMenuOpen, setConvMenuOpen] = useState<string | null>(null);
  const [editConvId, setEditConvId] = useState<string | null>(null);
  const [editConvName, setEditConvName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        convMenuOpen &&
        !(event.target as Element).closest(".conv-menu")
      ) {
        setConvMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [convMenuOpen]);

  const { data, loading, error } = useQuery<GetUserConversationsData>(
    GET_USER_CONVERSATIONS,
    {
      variables: { limit: 30 },
      fetchPolicy: "cache-and-network",
    }
  );

  const [createConversation] = useMutation<CreateConversationData>(
    CREATE_CONVERSATION_MUTATION
  );

  const [editConversation] = useMutation(EDIT_CONVERSATION_MUTATION, {
    onCompleted: () => {
      setIsEditModalOpen(false);
      setEditConvId(null);
      setEditConvName("");
    },
  });

  const [deleteConversation] = useMutation<DeleteConversationData>(
    DELETE_CONVERSATION_MUTATION,
    {
    update(cache, { data }) {
      const deletedId = data?.deleteConversation;
      if (!deletedId) return;

      const existing = cache.readQuery<GetUserConversationsData>({
        query: GET_USER_CONVERSATIONS,
        variables: { limit: 30 },
      });

      if (existing?.getUserConversations) {
        cache.writeQuery({
          query: GET_USER_CONVERSATIONS,
          variables: { limit: 30 },
          data: {
            ...existing,
            getUserConversations: {
              ...existing.getUserConversations,
              conversations: existing.getUserConversations.conversations.filter(
                (c) => c.id !== deletedId
              ),
            },
          },
        });
      }
    },
    onCompleted: (data) => {
      if (data?.deleteConversation === selectedConversationId) {
        onSelectConversation("");
      }
    },
  });

  const [markConversationRead] = useMutation(MARK_CONVERSATION_READ_MUTATION);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  // ✅ Normalize conversations (fix naming)
  const conversations = useMemo(() => {
    if (!data?.getUserConversations?.conversations) return [];

    return data.getUserConversations.conversations.map((conv) => {
      if (!conv.isGroup) {
        const other = conv.participants.find(
          (p: Participant) => p.id !== currentUser?.id
        );

        return {
          ...conv,
          name:
            conv.participants.length === 1
              ? "Me" // self chat
              : other?.username || "Unknown",
        };
      }

      return conv;
    });
  }, [data, currentUser]);

  // ✅ Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;

    return conversations.filter((conv) =>
      conv.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  // ✅ Create or open direct conversation
  const handleSelectUser = async (userId: string) => {
    if (!currentUser) return;

    // Check if conversation already exists
    const existing = conversations.find((conv) => {
      if (conv.isGroup) return false;

      const ids = conv.participants.map((p: Participant) => p.id).sort();

      if (userId === currentUser.id) {
        // self chat
        return ids.length === 1 && ids.includes(currentUser.id);
      }

      return (
        ids.length === 2 &&
        ids.includes(currentUser.id) &&
        ids.includes(userId)
      );
    });

    if (existing) {
      onSelectConversation(existing.id);
      return;
    }

    // Create new conversation
    const { data: newConv } = await createConversation({
      variables: {
        input: {
          participantIds:
            userId === currentUser.id
              ? [currentUser.id] // self chat
              : [currentUser.id, userId], // normal chat
          isGroup: false,
        },
      },
    });

    if (newConv?.createConversation?.id) {
      onSelectConversation(newConv.createConversation.id);
    }
  };

  // ✅ Users without existing conversations
  const usersWithoutConversation = useMemo(() => {
    if (!data?.getAllUsers || !currentUser) return [];

    return data.getAllUsers.filter((user: Participant) => {
      // Don't show current user
      if (user.id === currentUser.id) return false;

      // Check if conversation exists
      const exists = conversations.some((conv) => {
        if (conv.isGroup) return false;

        const ids = conv.participants.map((p: Participant) => p.id);

        return (
          ids.includes(currentUser.id) && ids.includes(user.id)
        );
      });

      return !exists;
    });
  }, [data, conversations, currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleGroupCreated = (conversationId: string) => {
    setIsGroupModalOpen(false);
    onSelectConversation(conversationId);
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="w-[30%] min-w-[320px] max-w-[450px] border-r flex flex-col bg-white dark:bg-[#111b21] h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between z-10">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-muted text-muted-foreground">
            {currentUser?.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-full text-muted-foreground hover:bg-muted/50"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsGroupModalOpen(true)}
            className="h-10 w-10 rounded-full text-muted-foreground hover:bg-muted/50"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleLogout}
            className="h-10 w-10 rounded-full text-muted-foreground hover:bg-muted/50"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b bg-white dark:bg-[#111b21]">
        <div className="relative flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5 shadow-sm">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or start new chat"
            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] h-8 p-0"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 bg-white dark:bg-[#111b21]">
        <div className="flex flex-col">
          {/* ✅ Loading & Error */}
          {loading && (
            <div className="flex justify-center p-6">
              <p className="text-sm text-muted-foreground">Loading chats...</p>
            </div>
          )}

          {error && (
            <p className="p-4 text-sm text-destructive">
              {error.message}
            </p>
          )}

          {/* ✅ Existing Conversations */}
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === selectedConversationId;
            const lastMessage = conv.lastMessage?.content || "(no messages)";
            const unreadCount = conv.unreadCounts?.[currentUser?.id] || 0;
            const isMeAdmin = conv.admins?.includes(currentUser?.id);

            return (
              <div key={conv.id} className="relative group border-b border-muted/30">
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full px-4 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] text-left transition flex items-center gap-3 ${
                    isSelected ? "bg-[#f0f2f5] dark:bg-[#2a3942]" : ""
                  }`}
                >
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                      {conv.name?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 border-none">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-semibold text-[15.5px] text-[#111b21] dark:text-[#e9edef] truncate">
                        {conv.name}
                      </span>

                      <span className={`text-[12px] ${unreadCount > 0 ? "text-[#00a884] font-semibold" : "text-muted-foreground"}`}>
                        {conv.lastMessageAt
                          ? formatTime(conv.lastMessageAt)
                          : ""}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-[13.5px] text-muted-foreground truncate flex-1">
                        {lastMessage}
                      </p>
                      {unreadCount > 0 && (
                        <div className="bg-[#00a884] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[19px] h-[19px] flex items-center justify-center ml-2 shadow-sm">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConvMenuOpen(convMenuOpen === conv.id ? null : conv.id);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>

                {convMenuOpen === conv.id && (
                  <div className="conv-menu absolute right-10 top-1/2 -translate-y-1/2 bg-card border border-border rounded-lg p-1 shadow-2xl z-20 w-44 overflow-hidden">
                    {conv.isGroup && isMeAdmin && (
                      <button
                        onClick={() => {
                          setEditConvId(conv.id);
                          setEditConvName(conv.name || "");
                          setIsEditModalOpen(true);
                          setConvMenuOpen(null);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded text-[13.5px] transition-colors"
                      >
                        Edit Group Info
                      </button>
                    )}
                    <button
                      onClick={() => {
                        deleteConversation({
                          variables: { conversationId: conv.id },
                        });
                        setConvMenuOpen(null);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded text-[13.5px] text-red-500 transition-colors"
                    >
                      Delete Chat
                    </button>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          markConversationRead({
                            variables: { conversationId: conv.id },
                          });
                          setConvMenuOpen(null);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded text-[13.5px] transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* ✅ Other Users (without conversations) */}
          {usersWithoutConversation.length > 0 && (
            <div className="p-4">
              <p className="text-[12.5px] font-bold text-[#00a884] uppercase tracking-wider mb-2">
                Contacts
              </p>
              {usersWithoutConversation.map((user: Participant) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="w-full py-2.5 flex items-center gap-3 hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] rounded-lg transition px-2"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {user.username[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-left">
                    <p className="font-semibold text-[14.5px] text-[#111b21] dark:text-[#e9edef]">{user.username}</p>
                    <p className="text-[12.5px] text-muted-foreground">
                      Start chatting
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Group Creation Modal */}
      <GroupCreationModal
        isOpen={isGroupModalOpen}
        onOpenChange={setIsGroupModalOpen}
        allUsers={data?.getAllUsers || []}
        currentUser={currentUser}
        onGroupCreated={handleGroupCreated}
      />

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group Name</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editConvName}
              onChange={(e) => setEditConvName(e.target.value)}
              placeholder="Group name"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!editConvId) return;
                editConversation({
                  variables: {
                    conversationId: editConvId,
                    name: editConvName,
                  },
                });
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}