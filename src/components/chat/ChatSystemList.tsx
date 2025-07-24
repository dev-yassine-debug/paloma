
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, User } from "lucide-react";
import ChatSystem from "./ChatSystem";

interface ChatSystemListProps {
  user: any;
}

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
}

const ChatSystemList = ({ user }: ChatSystemListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<{sellerId: string, sellerName: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      // Get all messages where current user is sender or receiver
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation and get the latest message for each
      const conversationMap = new Map();
      
      for (const message of messages || []) {
        const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        
        if (!conversationMap.has(otherUserId)) {
          // Get other user's profile
          const { data: otherUserProfile } = await supabase
            .from('profiles')
            .select('name, phone')
            .eq('id', otherUserId)
            .single();
          
          const otherUserName = otherUserProfile?.name || otherUserProfile?.phone || 'مستخدم';
          
          conversationMap.set(otherUserId, {
            id: otherUserId,
            other_user_id: otherUserId,
            other_user_name: otherUserName,
            last_message: message.content,
            last_message_time: message.created_at
          });
        }
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedChat) {
    return (
      <ChatSystem
        sellerId={selectedChat.sellerId}
        sellerName={selectedChat.sellerName}
        onClose={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          المحادثات
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">جاري تحميل المحادثات...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد محادثات</h3>
            <p className="text-gray-500">ابدأ محادثة مع البائعين من صفحة المنتجات</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant="ghost"
                className="w-full justify-start p-4 h-auto"
                onClick={() => setSelectedChat({
                  sellerId: conversation.other_user_id,
                  sellerName: conversation.other_user_name
                })}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="font-medium text-gray-900">
                      {conversation.other_user_name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.last_message}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(conversation.last_message_time).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatSystemList;
