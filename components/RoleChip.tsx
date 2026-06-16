import { ROLE_LABELS, type Role } from '@/lib/process-definition';

const ROLE_ABBR: Record<Role, string> = {
  pm: 'PM',
  product: 'PR',
  dev: 'DV',
  qa: 'QA',
};

const ROLE_CLASS: Record<Role, string> = {
  pm: 'role-pm',
  product: 'role-product',
  dev: 'role-dev',
  qa: 'role-qa',
};

export function RoleChip({ role, label = true }: { role: Role; label?: boolean }) {
  return (
    <span className="role-chip">
      <span className={`role-dot ${ROLE_CLASS[role]}`}>{ROLE_ABBR[role]}</span>
      {label && ROLE_LABELS[role]}
    </span>
  );
}

export function RoleChips({ roles }: { roles: Role[] }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
      {roles.map((r) => (
        <RoleChip key={r} role={r} />
      ))}
    </span>
  );
}
