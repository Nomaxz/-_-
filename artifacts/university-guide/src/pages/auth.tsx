import { useState, type FormEvent } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { useLoginCampass, useRegisterCampass } from '@workspace/api-client-react';
import { tr, useLanguage } from '../language';
import { errorMessage } from '../features/api-errors';
import { useIdentityChange, useSession } from '../features/session';

function safeNext(raw: string | null) {
  return raw && /^\/(?!\/)/.test(raw) && !/[\\\u0000-\u001f]/.test(raw) ? raw : '/profile';
}

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const { language } = useLanguage();
  const search = useSearch();
  const next = safeNext(new URLSearchParams(search).get('next'));
  const [, navigate] = useLocation();
  const { user } = useSession();
  const login = useLoginCampass();
  const register = useRegisterCampass();
  const onIdentity = useIdentityChange();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const mutation = mode === 'sign-in' ? login : register;
  const isUp = mode === 'sign-up';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (mutation.isPending) return;
    setLocalError(null);
    const name = username.trim();
    if (name.length < 3 || name.length > 30) { setLocalError(tr(language, 'Имя пользователя: от 3 до 30 символов.', 'Username must be 3–30 characters.')); return; }
    if (password.length < 8 || password.length > 128) { setLocalError(tr(language, 'Пароль: от 8 до 128 символов.', 'Password must be 8–128 characters.')); return; }
    try {
      const result = await mutation.mutateAsync({ data: { username: name, password } });
      setPassword('');
      await onIdentity(result);
      navigate(next);
    } catch (error) {
      setLocalError(errorMessage(error, language));
    }
  };

  const otherHref = `${isUp ? '/sign-in' : '/sign-up'}${next !== '/profile' ? `?next=${encodeURIComponent(next)}` : ''}`;

  return (
    <div className="page auth-page">
      <div className="eyebrow">Campass</div>
      <h1 className="page-title">{isUp ? tr(language, 'Регистрация', 'Create account') : tr(language, 'Вход', 'Sign in')}</h1>
      {user && <p className="coverage-note" data-testid="text-already-signed-in">{tr(language, 'Вы уже вошли как', 'You are already signed in as')} <strong>{user.username}</strong>. <Link href="/profile">{tr(language, 'Открыть профиль', 'Open profile')}</Link></p>}
      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="auth-username">{tr(language, 'Имя пользователя', 'Username')}</label>
          <input id="auth-username" className="control" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} data-testid="input-username" />
        </div>
        <div className="field">
          <label htmlFor="auth-password">{tr(language, 'Пароль', 'Password')}</label>
          <input id="auth-password" className="control" type="password" autoComplete={isUp ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128} data-testid="input-password" />
          {isUp && <small className="muted-note">{tr(language, 'Не менее 8 символов.', 'At least 8 characters.')}</small>}
        </div>
        {localError && <p className="form-error" role="alert" data-testid="text-auth-error">{localError}</p>}
        <button type="submit" className="button" disabled={mutation.isPending} data-testid="button-auth-submit">
          {mutation.isPending ? tr(language, 'Подождите…', 'Please wait…') : isUp ? tr(language, 'Создать аккаунт', 'Create account') : tr(language, 'Войти', 'Sign in')}
        </button>
        {isUp && <p className="disclaimer" data-testid="text-no-recovery">{tr(language, 'Восстановления пароля в этой версии нет, а почта не запрашивается. Запомните имя и пароль — без них доступ к сохранённому не вернуть.', 'There is no password recovery in this version and no email is collected. Remember your username and password — without them saved data cannot be recovered.')}</p>}
        <p className="muted-line">
          {isUp ? tr(language, 'Уже есть аккаунт?', 'Already have an account?') : tr(language, 'Нет аккаунта?', 'No account yet?')}{' '}
          <Link href={otherHref} data-testid="link-auth-switch">{isUp ? tr(language, 'Войти', 'Sign in') : tr(language, 'Зарегистрироваться', 'Create one')}</Link>
        </p>
      </form>
    </div>
  );
}
