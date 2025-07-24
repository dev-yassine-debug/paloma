import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Phone } from "lucide-react";
import AdminUserActions from "@/components/admin/AdminUserActions";

interface UserCardProps {
  user: any;
  onUpdate: () => void;
}

const UserCard = ({ user, onUpdate }: UserCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{user.name || 'بدون اسم'}</h3>
              </div>
              
              {user.phone && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                انضم في: {new Date(user.created_at).toLocaleDateString('ar-SA')}
              </div>
            </div>
          </div>
          
          <AdminUserActions user={user} onUpdate={onUpdate} />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;