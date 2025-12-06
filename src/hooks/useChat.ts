"use client";

import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@/context/UserContext";
import { useCallback, useState } from "react";

interface ChatResponse {
  response: string;
  agent: string;
}

export function useChat() {
  const { userId } = useUser();
  const sendMessageAction = useAction(api.chat.sendMessage);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (message: string, isIslamic: boolean): Promise<ChatResponse | null> => {
      if (!userId) {
        return null;
      }

      setIsLoading(true);
      try {
        const response = await sendMessageAction({
          userId,
          message,
          isIslamic,
        });
        return response;
      } catch (error) {
        console.error("Chat error:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, sendMessageAction]
  );

  return {
    sendMessage,
    isLoading,
  };
}

