import type { ReactNode } from 'react';
import { Link } from 'wouter';
import type { CampassUser } from '@workspace/api-client-react';
import { tr, useLanguage } from '../language';
import { useSession } from './session';

export function PrivateGate({ path, title, reason, children }: {
  path: string;
  title: string;
  reason: string;
  children: (user: CampassUser) => ReactNode;
}) {
  const { language } = useLanguage();
  const { user, isLoading, isError, refetch } = useSession();
  if (isLoading) return <div className="page"><div className="skeleton-block" /><div className="skeleton-block short" /></div>;
  if (isError) {
    return (
      <div className="page"><div className="empty-state" data-testid="state-session-error">
        <h2>{tr(language, 'Не удалось проверить вход', 'Could not check your session')}</h2>
        <button type="button" className="button secondary" onClick={() => refetch()} data-testid="button-retry-session">{tr(language, 'Повторить', 'Retry')}</button>
      </div></div>
    );
  }
  if (!user) {
    return (
      <div className="page">
        <div className="eyebrow">Campass</div>
        <h1 className="page-title">{title}</h1>
        <div className="signin-prompt" data-testid="prompt-sign-in">
          <p>{reason}</p>
          <div className="action-row">
            <Link href={`/sign-in?next=${encodeURIComponent(path)}`} className="button" data-testid="link-prompt-sign-in">{tr(language, 'Войти', 'Sign in')}</Link>
            <Link href={`/sign-up?next=${encodeURIComponent(path)}`} className="button secondary" data-testid="link-prompt-sign-up">{tr(language, 'Создать аккаунт', 'Create account')}</Link>
          </div>
        </div>
      </div>
    );
  }
  return <>{children(user)}</>;
}
