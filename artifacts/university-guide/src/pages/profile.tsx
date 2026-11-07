import { Link, useLocation } from 'wouter';
import { ClipboardList, Trash2 } from 'lucide-react';
import { useLogoutCampass, useRemoveCampassFavorite, type CampassUser } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { universities } from '../catalog';
import { tr, useLanguage } from '../language';
import { errorMessage } from '../features/api-errors';
import { CompareToggle } from '../features/university-actions';
import { PrivateGate } from '../features/private-gate';
import { useFavorites, useIdentityChange, useInvalidatePrivate } from '../features/session';

const byId = new Map(universities.map((item) => [item.id, item]));

function ProfileBody({ user }: { user: CampassUser }) {
  const { language } = useLanguage();
  const favorites = useFavorites(user.id);
  const remove = useRemoveCampassFavorite();
  const logout = useLogoutCampass();
  const onIdentity = useIdentityChange();
  const invalidate = useInvalidatePrivate();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const doLogout = async () => {
    try {
      await logout.mutateAsync();
      await onIdentity(null);
      navigate('/');
    } catch (error) {
      toast({ title: tr(language, 'Не удалось выйти', 'Could not sign out'), description: errorMessage(error, language), variant: 'destructive' });
    }
  };
  const removeFav = async (universityId: string) => {
    try {
      await remove.mutateAsync({ universityId });
      await invalidate('favorites');
      toast({ title: tr(language, 'Убрано из сохранённых', 'Removed from saved') });
    } catch (error) {
      toast({ title: tr(language, 'Не удалось убрать', 'Could not remove'), description: errorMessage(error, language), variant: 'destructive' });
    }
  };

  return (
    <div className="page">
      <div className="eyebrow">{tr(language, 'Профиль', 'Profile')}</div>
      <div className="profile-head">
        <h1 className="page-title" data-testid="text-username">{user.username}</h1>
        <button type="button" className="button secondary" onClick={doLogout} disabled={logout.isPending} data-testid="button-logout">
          {logout.isPending ? tr(language, 'Выходим…', 'Signing out…') : tr(language, 'Выйти', 'Sign out')}
        </button>
      </div>
      <p className="coverage-note">{tr(language, 'Аккаунт создан', 'Account created')}: {new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-GB').format(new Date(user.createdAt))}</p>
      <h2 className="section-title">{tr(language, 'Сохранённые университеты', 'Saved universities')}</h2>
      {favorites.isLoading ? (
        <div className="university-list"><div className="skeleton-block" /><div className="skeleton-block" /></div>
      ) : favorites.isError ? (
        <div className="empty-state" data-testid="state-favorites-error"><h2>{errorMessage(favorites.error, language)}</h2><button type="button" className="button secondary" onClick={() => favorites.refetch()} data-testid="button-retry-favorites">{tr(language, 'Повторить', 'Retry')}</button></div>
      ) : !favorites.data?.length ? (
        <div className="empty-state" data-testid="empty-favorites">
          <h2>{tr(language, 'Пока ничего не сохранено', 'Nothing saved yet')}</h2>
          <p>{tr(language, 'Нажмите «Сохранить» на карточке вуза в каталоге.', 'Press “Save” on a university card in the directory.')}</p>
          <Link href="/" className="button secondary" data-testid="link-empty-catalog">{tr(language, 'Открыть каталог', 'Open directory')}</Link>
        </div>
      ) : (
        <ul className="saved-list" data-testid="list-favorites">
          {favorites.data.map((fav) => {
            const university = byId.get(fav.universityId);
            return (
              <li key={fav.universityId} className="saved-item" data-testid={`favorite-${fav.universityId}`}>
                <div>
                  {university ? <Link href={`/university/${fav.universityId}`} className="recommendation-name">{fav.universityName}</Link> : <strong>{fav.universityName}</strong>}
                  <div className="uni-loc">{fav.countryCode}</div>
                </div>
                <div className="action-row">
                  {university && <CompareToggle university={university} />}
                  <Link href={`/admissions?university=${encodeURIComponent(fav.universityId)}`} className="chip-button" data-testid={`link-plan-${fav.universityId}`}><ClipboardList size={14} aria-hidden="true" />{tr(language, 'План', 'Plan')}</Link>
                  <button type="button" className="chip-button danger" onClick={() => removeFav(fav.universityId)} disabled={remove.isPending} data-testid={`button-remove-favorite-${fav.universityId}`}><Trash2 size={14} aria-hidden="true" />{tr(language, 'Убрать', 'Remove')}</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ProfilePage() {
  const { language } = useLanguage();
  return (
    <PrivateGate path="/profile" title={tr(language, 'Профиль', 'Profile')}
      reason={tr(language, 'Войдите, чтобы увидеть сохранённые университеты. Они хранятся на сервере и доступны после перезагрузки.', 'Sign in to see your saved universities. They are stored on the server and survive reloads.')}>
      {(user) => <ProfileBody user={user} />}
    </PrivateGate>
  );
}
