import { useState, useMemo } from "react";
import { useMutation } from "@apollo/client/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Users, Search } from "lucide-react";
import {
  CREATE_CONVERSATION_MUTATION,
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
}

interface CreateConversationData {
  createConversation: Conversation;
}

interface GroupCreationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allUsers: Participant[];
  currentUser: Participant | null;
  onGroupCreated: (conversationId: string) => void;
}

export default function GroupCreationModal({
  isOpen,
  onOpenChange,
  allUsers,
  currentUser,
  onGroupCreated,
}: GroupCreationModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [createConversation, { loading }] = useMutation<CreateConversationData>(CREATE_CONVERSATION_MUTATION, {
    refetchQueries: [{ query: GET_USER_CONVERSATIONS, variables: { limit: 30 } }],
  });

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;
    return allUsers.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allUsers, searchQuery]);

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUserIds(prev => prev.filter(id => id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUserIds.length === 0 || !currentUser) return;

    const participantIds = [currentUser.id, ...selectedUserIds];

    try {
      const { data } = await createConversation({
        variables: {
          input: {
            name: groupName.trim(),
            participantIds,
            isGroup: true,
          },
        },
      });

      if (data?.createConversation?.id) {
        onGroupCreated(data.createConversation.id);
        // Reset state
        setGroupName("");
        setSelectedUserIds([]);
        setSearchQuery("");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const selectedUsers = allUsers.filter(user => selectedUserIds.includes(user.id));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            New Group
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Group Name Input */}
          <div>
            <Input
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Selected Users */}
          {selectedUserIds.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                Selected ({selectedUserIds.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                    {user.username}
                    <button
                      onClick={() => handleRemoveSelectedUser(user.id)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* User List */}
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              {filteredUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => handleUserToggle(user.id)}
                    className={`w-full p-3 text-left rounded-lg transition-colors ${
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.username}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Create Button */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedUserIds.length === 0 || loading}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}