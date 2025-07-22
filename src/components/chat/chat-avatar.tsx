import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Message } from "@/types";

interface ChatAvatarProps {
  message: Message;
}

export function ChatAvatar({ message }: ChatAvatarProps) {
  return (
    <Avatar className={cn("flex justify-start items-center")}>
      <AvatarImage
        src={
          message.sender === "bot"
            ? "/bot-avatar.png"
            : "/user-avatar.png"
        }
        alt={message.sender}
        width={6}
        height={6}
        className="w-6 h-6"
      />
      <AvatarFallback>
        {message.sender === "bot" ? (
          <Bot className="w-6 h-6" />
        ) : (
          <User className="w-6 h-6" />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
