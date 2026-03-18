// src/components/Chat/ChatWindow.tsx

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const mockMessages = [
  { id: "1", sender: "me", content: "Hey bro!", time: "10:00 AM" },
  { id: "2", sender: "other", content: "How far?", time: "10:01 AM" },
  { id: "3", sender: "me", content: "All good 🔥", time: "10:02 AM" },
];

export default function ChatWindow() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">John Doe</p>
          <p className="text-xs text-gray-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  msg.sender === "me"
                    ? "bg-black text-white"
                    : "bg-white border"
                }`}
              >
                <p>{msg.content}</p>
                <span className="block text-[10px] mt-1 opacity-70 text-right">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-white flex gap-2">
        <Input placeholder="Type a message..." />
        <Button>Send</Button>
      </div>
    </div>
  );
}