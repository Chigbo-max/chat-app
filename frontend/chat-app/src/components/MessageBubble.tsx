
import clsx from "clsx";

interface Props {
  sender: "me" | "first";
  content: string;
}

export default function MessageBubble({ sender, content }: Props) {
  const isMe = sender === "me";

  return (
    <div className={clsx("flex mb-2", isMe ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "p-2 rounded-lg max-w-xs",
          isMe ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
        )}
      >
        {content}
      </div>
    </div>
  );
}