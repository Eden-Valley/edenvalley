import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserNavProps {
  firstName: string;
  lastName: string;
  email: string;
  onSignOut: () => void;
}

function UserNav({ firstName, lastName, email, onSignOut }: UserNavProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative h-8 w-8 rounded-sm border border-primary/20 bg-background hover:border-primary/50 transition-colors"
        >
          <Avatar className="h-8 w-8 rounded-sm">
            <AvatarFallback className="rounded-sm bg-primary/10 text-primary font-display text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-background" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-foreground">{firstName} {lastName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-eden-crimson focus:text-eden-crimson focus:bg-eden-crimson/10"
          onClick={onSignOut}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserNav;
