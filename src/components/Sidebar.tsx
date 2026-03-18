// src/components/Chat/Sidebar.tsx

import React from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockConversations = [
  {
    id: "1",
    name: "John Doe",
    lastMessage: "Hey bro, how far?",
    time: "2m",
  },
  {
    id: "2",
    name: "Jane Smith",
    lastMessage: "Let's catch up later",
    time: "10m",
  },
  {
    id: "3",
    name: "Dev Group",
    lastMessage: "New update deployed 🚀",
    time: "1h",
  },
];

export default function Sidebar() {
  return (
    <div className="w-1/4 border-r flex flex-col bg-white">
      
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <Input placeholder="Search chats..." />
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {mockConversations.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition"
            >
              <Avatar>
                <AvatarFallback>
                  {chat.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{chat.name}</span>
                  <span className="text-xs text-gray-500">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}