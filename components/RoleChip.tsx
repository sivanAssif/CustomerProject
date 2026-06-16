import { ROLE_LABELS, ROLE_ABBR, type Role } from '@/lib/process-definition';

export const ROLE_VAR: Record<Role, string> = {
  pm: 'var(--role-pm)',
  product: 'var(--role-product)',
  dev: 'var(--role-dev)',
  qa: 'var(--role-qa)',
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
