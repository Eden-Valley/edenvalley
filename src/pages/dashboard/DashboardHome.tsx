import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileEdit, Users, UserPlus, DollarSign, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const cards = [
  {
    title: 'Your Blueprint',
    icon: FileEdit,
    message: 'Not yet created. Start structuring your vision.',
    button: 'Create Blueprint',
    route: '/dashboard/blueprint',
  },
  {
    title: 'Find a Match',
    icon: Users,
    message: 'No match yet. Explore potential co-founders.',
    button: 'Find Co-founder',
    route: '/dashboard/match',
    comingSoon: true,
  },
  {
    title: 'Your Team',
    icon: UserPlus,
    message: 'Build your team after finding a match.',
    button: 'Manage Team',
    route: '/dashboard/team',
    comingSoon: true,
  },
  {
    title: 'Funding',
    icon: DollarSign,
    message: 'Complete your Blueprint + Match to unlock funding.',
    button: 'View Funding',
    route: '/dashboard/havila',
    comingSoon: true,
  },
];

function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Welcome back,{' '}
          <span className="text-primary">{user?.firstName}</span>
        </h1>
        <p className="font-body text-muted-foreground mt-1">
          Your journey continues. Here's where you stand.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-sm border border-primary/10 bg-background p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="bg-primary/10 p-2 rounded-sm">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-foreground text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className="font-body text-muted-foreground text-xs leading-relaxed mb-4">
                {card.message}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => {
                  if (card.comingSoon) {
                    toast('Coming soon', {
                      description: `The ${card.title.toLowerCase()} feature is not ready yet.`,
                    });
                  } else {
                    navigate(card.route);
                  }
                }}
              >
                {card.button}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="rounded-sm border border-primary/10 p-5">
        <h2 className="font-display text-foreground text-sm font-medium mb-2">
          Recent Activity
        </h2>
        <p className="font-body text-muted-foreground text-xs">
          No recent activity yet. Start by creating your blueprint.
        </p>
      </div>
    </div>
  );
}

export default DashboardHome;
