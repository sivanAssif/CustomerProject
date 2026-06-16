import type { FlowNode, Role } from '@/lib/process-definition';
import { ROLE_ABBR } from '@/lib/process-definition';
import { ROLE_VAR } from './RoleChip';

const ROLE_CLASS: Record<Role, string> = {
  pm: 'role-pm',
  product: 'role-product',
  dev: 'role-dev',
  qa: 'role-qa',
};

/** תרשים ה-flow של קבוצה: מי מבצע → מוסר ל → מי מקבל */
export function Flow({ nodes }: { nodes: FlowNode[] }) {
  return (
    <div className="flow">
      {nodes.map((n, i) => {
        // צומת-מחבר (חץ + תווית בלבד)
        if (!n.role && !n.tag) {
          return (
            <div className="flow-conn" key={i}>
              <span className="arrow">←</span>
              <span>{n.caption}</span>
            </div>
          );
        }
        // צומת קבוצתי (כל ...)
        if (n.tag) {
          return (
            <div className="flow-node" key={i}>
              <span className="cap">{n.caption}</span>
              <span className="flow-group">
                {n.tag && <strong>{n.tag}</strong>}
                {n.text}
              </span>
            </div>
          );
        }
        // צומת תפקיד
        return (
          <div className="flow-node" key={i}>
            <span className="cap">{n.caption}</span>
            <span className="who">
              <span
                className={`role-dot ${ROLE_CLASS[n.role as Role]}`}
                style={{ background: ROLE_VAR[n.role as Role] }}
              >
                {ROLE_ABBR[n.role as Role]}
              </span>
              {n.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
