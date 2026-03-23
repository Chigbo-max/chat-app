// src/components/Chat/Sidebar.tsx

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import GroupCreationModal from "./GroupCreationModal";
import {
  GET_USER_CONVERSATIONS,
  CREATE_CONVERSATION_MUTATION,
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

export default function Sidebar({
  selectedConversationId,
  onSelectConversation,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

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

  return (
    <div className="w-80 border-r flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chats</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsGroupModalOpen(true)}
          >
            New Group
          </Button>
          <Button size="sm" variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {/* ✅ Loading & Error */}
          {loading && (
            <p className="p-4 text-sm text-muted-foreground">
              Loading...
            </p>
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

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`p-3 hover:bg-muted text-left border-b transition ${
                  isSelected ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {conv.name?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium truncate">
                        {conv.name}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {conv.lastMessageAt
                          ? new Date(
                              conv.lastMessageAt
                            ).toLocaleTimeString()
                          : ""}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

          {/* ✅ Other Users (without conversations) */}
          {usersWithoutConversation.map((user: Participant) => (
            <button
              key={user.id}
              onClick={() => handleSelectUser(user.id)}
              className="p-3 hover:bg-muted text-left border-b transition"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {user.username[0]}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">
                    Start chat
                  </p>
                </div>
              </div>
            </button>
          ))}
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
    </div>
  );
}