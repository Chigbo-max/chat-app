
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);

  return (
    <div className="flex h-screen">
      <Sidebar selectedConversationId={selectedConversationId} onSelectConversation={setSelectedConversationId} />
      <ChatWindow conversationId={selectedConversationId} onConversationCreated={setSelectedConversationId} />
    </div>
  );
}
