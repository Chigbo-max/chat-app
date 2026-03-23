import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { ApolloCache } from "@apollo/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Crown, UserMinus, UserPlus, X } from "lucide-react";
import {
  REMOVE_PARTICIPANT_MUTATION,
  MAKE_ADMIN_MUTATION,
  REMOVE_ADMIN_MUTATION,
  ADD_PARTICIPANT_MUTATION,
  GET_CONVERSATION,
  GET_USER_CONVERSATIONS,
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
}

interface GetUserConversationsData {
  getUserConversations: {
    conversations: Conversation[];
    nextCursor?: string;
    hasNextPage: boolean;
  };
  getAllUsers: Participant[];
}

interface GroupManagementModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation | null;
  currentUser: Participant | null;
  allUsers: Participant[];
}

export default function GroupManagementModal({
  isOpen,
  onOpenChange,
  conversation,
  currentUser,
  allUsers,
}: GroupManagementModalProps) {
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const updateConversationCache = (
    cache: ApolloCache,
    updatedConversation: Conversation | null
  ) => {
    if (!updatedConversation || !conversation?.id) return;

    cache.writeQuery({
      query: GET_CONVERSATION,
      variables: { id: conversation.id },
      data: { getConversation: updatedConversation },
    });

    try {
      const existingUserConv = cache.readQuery<GetUserConversationsData>({
        query: GET_USER_CONVERSATIONS,
        variables: { limit: 30 },
      });

      if (existingUserConv?.getUserConversations?.conversations) {
        const updatedList = existingUserConv.getUserConversations.conversations.map(
          (conv: Conversation) =>
            conv.id === updatedConversation.id
              ? {
                  ...conv,
                  participants: updatedConversation.participants,
                  admins: updatedConversation.admins,
                }
              : conv
        );

        cache.writeQuery({
          query: GET_USER_CONVERSATIONS,
          variables: { limit: 30 },
          data: {
            ...existingUserConv,
            getUserConversations: {
              ...existingUserConv.getUserConversations,
              conversations: updatedList,
            },
          },
        });
      }
    } catch {
      // ignore if not in cache yet
    }
  };

  const [removeParticipant] = useMutation<
    { removeParticipant: Conversation },
    { conversationId: string; userId: string }
  >(REMOVE_PARTICIPANT_MUTATION, {
    update: (cache, result) => {
      updateConversationCache(cache, result.data?.removeParticipant || null);
    },
    awaitRefetchQueries: true,
  });

  const [makeAdmin] = useMutation<
    { makeAdmin: Conversation },
    { conversationId: string; userId: string }
  >(MAKE_ADMIN_MUTATION, {
    update: (cache, result) => {
      updateConversationCache(cache, result.data?.makeAdmin || null);
    },
    awaitRefetchQueries: true,
  });

  const [removeAdmin] = useMutation<
    { removeAdmin: Conversation },
    { conversationId: string; userId: string }
  >(REMOVE_ADMIN_MUTATION, {
    update: (cache, result) => {
      updateConversationCache(cache, result.data?.removeAdmin || null);
    },
    awaitRefetchQueries: true,
  });

  const [addParticipant] = useMutation<
    { addParticipant: Conversation },
    { conversationId: string; userId: string }
  >(ADD_PARTICIPANT_MUTATION, {
    update: (cache, result) => {
      updateConversationCache(cache, result.data?.addParticipant || null);
    },
    awaitRefetchQueries: true,
  });

  if (!conversation || !currentUser) return null;

  const isCurrentUserAdmin = conversation.admins.includes(currentUser.id);
  const participants = conversation.participants;
  const admins = conversation.admins;

  // Users not in the group (for adding)
  const availableUsers = allUsers.filter(
    user => !participants.some(p => p.id === user.id)
  );

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveParticipant = async (userId: string) => {
    if (!conversation.id) return;
    await removeParticipant({
      variables: { conversationId: conversation.id, userId },
    });
  };

  const handleMakeAdmin = async (userId: string) => {
    if (!conversation.id) return;
    await makeAdmin({
      variables: { conversationId: conversation.id, userId },
    });
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!conversation.id) return;
    await removeAdmin({
      variables: { conversationId: conversation.id, userId },
    });
  };

  const handleAddParticipant = async (userId: string) => {
    if (!conversation.id) return;
    await addParticipant({
      variables: { conversationId: conversation.id, userId },
    });
    setShowAddMembers(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Group Settings
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{conversation.name}</p>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Group Info */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="text-lg">
                  {conversation.name?.[0] || "G"}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="font-semibold">{conversation.name}</h3>
            <p className="text-sm text-muted-foreground">
              {participants.length} members
            </p>
          </div>

          {/* Add Members Button (Admin Only) */}
          {isCurrentUserAdmin && (
            <Button
              variant="outline"
              onClick={() => setShowAddMembers(!showAddMembers)}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Members
            </Button>
          )}

          {/* Add Members Section */}
          {showAddMembers && isCurrentUserAdmin && (
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Add Members</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMembers(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border rounded mb-3 text-sm"
              />

              <ScrollArea className="max-h-32">
                <div className="space-y-1">
                  {filteredAvailableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAddParticipant(user.id)}
                      className="w-full p-2 text-left hover:bg-muted rounded flex items-center gap-3"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.username}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Members List */}
          <div className="flex-1 min-h-0">
            <h4 className="font-medium mb-3">Members ({participants.length})</h4>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {participants.map((participant) => {
                  const isAdmin = admins.includes(participant.id);
                  const isCurrentUser = participant.id === currentUser.id;

                  return (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {participant.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {participant.username}
                            {isAdmin && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </p>
                          {isCurrentUser && (
                            <p className="text-xs text-muted-foreground">You</p>
                          )}
                        </div>
                      </div>

                      {/* Admin Controls */}
                      {isCurrentUserAdmin && !isCurrentUser && (
                        <div className="flex gap-1">
                          {!isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMakeAdmin(participant.id)}
                              className="text-xs"
                            >
                              Make Admin
                            </Button>
                          )}
                          {isAdmin && participant.id !== currentUser.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveAdmin(participant.id)}
                              className="text-xs"
                            >
                              Remove Admin
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveParticipant(participant.id)}
                            className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <UserMinus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}