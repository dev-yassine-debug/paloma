import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import ChatSystem from "@/components/chat/ChatSystem";

interface ChatButtonProps {
  sellerId: string;
  sellerName: string;
}

const ChatButton = ({ sellerId, sellerName }: ChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="w-4 h-4 ml-1" />
          تواصل مع البائع
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>محادثة مع {sellerName}</DialogTitle>
          <DialogDescription>
            يمكنك التواصل مباشرة مع البائع هنا
          </DialogDescription>
        </DialogHeader>
        <ChatSystem 
          sellerId={sellerId} 
          sellerName={sellerName} 
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ChatButton;