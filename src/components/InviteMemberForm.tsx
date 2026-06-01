import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { InviteRequest } from '@/services/api';

interface InviteMemberFormProps {
  onSubmit: (data: InviteRequest) => void;
  onCancel: () => void;
}

const ROLES = ['CEO', 'CTO', 'COO', 'CFO', 'CMO', 'Advisor', 'Team Member'];

function InviteMemberForm({ onSubmit, onCancel }: InviteMemberFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Team Member');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit({ email: email.trim(), role });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="invite-email" className="font-body text-xs text-muted-foreground block mb-1">
          Email Address
        </label>
        <input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          className="w-full bg-background border border-primary/10 rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          aria-label="Email"
          required
        />
      </div>
      <div>
        <label htmlFor="invite-role" className="font-body text-xs text-muted-foreground block mb-1">
          Role
        </label>
        <select
          id="invite-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full bg-background border border-primary/10 rounded-sm px-3 py-2 text-sm text-foreground"
          aria-label="Role"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={!email.trim()}>Send Invite</Button>
      </div>
    </form>
  );
}

export default InviteMemberForm;
