import { Users, Circle, Crown } from 'lucide-react';

const UserList = ({ users }) => {
  return (
    <div className="bg-card rounded-lg border border-panel-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-panel-border bg-secondary/30">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium text-sm">Connected Users</span>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {users.length}
        </span>
      </div>
      
      <div className="p-2 space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
        {users.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No users connected
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* User avatar with color indicator */}
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ 
                    backgroundColor: `${user.color}20`,
                    color: user.color,
                    border: `2px solid ${user.color}`,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <Circle
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-success text-success"
                />
              </div>
              
              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {user.name}
                  </span>
                  {user.isCurrentUser && (
                    <span className="text-xs text-muted-foreground">(You)</span>
                  )}
                  {index === 0 && !user.isCurrentUser && (
                    <Crown className="w-3.5 h-3.5 text-warning" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Online
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;
