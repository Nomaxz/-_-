import { useState } from 'react';
import { universityKey } from '@workspace/campass-data';
import { Link, useLocation } from 'wouter';
import { Bookmark, BookmarkCheck, ClipboardList, Columns3 } from 'lucide-react';
import { useCreateCampassPlan, useRemoveCampassFavorite, useSaveCampassFavorite } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import type { University } from '../catalog';
import { universities } from '../catalog';
import { tr, useLanguage } from '../language';
import { errorMessage } from './api-errors';
import { COMPARE_MAX, compareStore, useCompareIds } from './compare-store';
import { useFavorites, useInvalidatePrivate, usePlans, useSession } from './session';

const comparisonIdentities = new Map(universities.map((item) => [item.id, universityKey(item)]));

export function CompareToggle({ university }: { university: University }) {
  const { language } = useLanguage();
  const ids = useCompareIds();
  const { toast } = useToast();
  const selectedId = ids.find((id) => comparisonIdentities.get(id) === universityKey(university));
  const selected = Boolean(selectedId);
  const full = !selected && ids.length >= COMPARE_MAX;
  return (
    <button type="button" className={`chip-button ${selected ? 'on' : ''}`} aria-pressed={selected}
      onClick={() => {
        if (selectedId) { compareStore.remove(selectedId); return; }
        if (compareStore.add(university.id) === 'full') {
          toast({ title: tr(language, 'В сравнении уже 4 вуза', 'Comparison already has 4 universities'), description: tr(language, 'Уберите один, чтобы добавить новый.', 'Remove one to add another.') });
        }
      }}
      title={full ? tr(language, 'Максимум 4 вуза', 'Maximum 4 universities') : undefined}
      data-testid={`button-compare-${university.id}`}>
      <Columns3 size={14} aria-hidden="true" />
      {selected ? tr(language, 'В сравнении', 'Comparing') : tr(language, 'Сравнить', 'Compare')}
    </button>
  );
}

export function UniversityActions({ university }: { university: University }) {
  const { language } = useLanguage();
  const { user } = useSession();
  const favorites = useFavorites(user?.id);
  const plans = usePlans(user?.id);
  const invalidate = useInvalidatePrivate();
  const save = useSaveCampassFavorite();
  const remove = useRemoveCampassFavorite();
  const createPlan = useCreateCampassPlan();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [guestHint, setGuestHint] = useState(false);

  const isSaved = Boolean(favorites.data?.some((item) => item.universityName === university.name && item.countryCode === university.countryCode));
  const existingPlan = plans.data?.find((item) => item.universityName === university.name && item.countryCode === university.countryCode);
  const busy = save.isPending || remove.isPending;

  const toggleSave = async () => {
    if (!user) { setGuestHint(true); return; }
    try {
      if (isSaved) {
        await remove.mutateAsync({ universityId: university.id });
        toast({ title: tr(language, 'Убрано из сохранённых', 'Removed from saved') });
      } else {
        await save.mutateAsync({ data: { universityId: university.id } });
        toast({ title: tr(language, 'Сохранено в профиле', 'Saved to your profile') });
      }
      await invalidate('favorites');
    } catch (error) {
      toast({ title: tr(language, 'Не сохранено', 'Not saved'), description: errorMessage(error, language), variant: 'destructive' });
    }
  };

  const startPlan = async () => {
    if (!user) { setGuestHint(true); return; }
    if (existingPlan) { navigate(`/admissions#plan-${existingPlan.id}`); return; }
    try {
      const plan = await createPlan.mutateAsync({ data: { universityId: university.id } });
      await invalidate('plans');
      toast({ title: tr(language, 'План подготовки создан', 'Preparation plan created') });
      navigate(`/admissions#plan-${plan.id}`);
    } catch (error) {
      toast({ title: tr(language, 'План не создан', 'Plan not created'), description: errorMessage(error, language), variant: 'destructive' });
    }
  };

  return (
    <div className="action-row" data-testid={`actions-${university.id}`}>
      <button type="button" className={`chip-button ${isSaved ? 'on' : ''}`} onClick={toggleSave} disabled={busy || (Boolean(user) && favorites.isLoading)} aria-pressed={isSaved} data-testid={`button-save-${university.id}`}>
        {isSaved ? <BookmarkCheck size={14} aria-hidden="true" /> : <Bookmark size={14} aria-hidden="true" />}
        {busy ? tr(language, 'Сохраняем…', 'Saving…') : isSaved ? tr(language, 'Сохранено', 'Saved') : tr(language, 'Сохранить', 'Save')}
      </button>
      <CompareToggle university={university} />
      <button type="button" className="chip-button" onClick={startPlan} disabled={createPlan.isPending} data-testid={`button-plan-${university.id}`}>
        <ClipboardList size={14} aria-hidden="true" />
        {createPlan.isPending ? tr(language, 'Создаём…', 'Creating…') : existingPlan ? tr(language, 'Открыть план', 'Open plan') : tr(language, 'В план подготовки', 'Add to plan')}
      </button>
      {guestHint && !user && (
        <p className="guest-hint" role="status" data-testid={`text-guest-hint-${university.id}`}>
          {tr(language, 'Сохранение и планы доступны после входа.', 'Saving and plans are available after signing in.')}{' '}
          <Link href={`/sign-in?next=${encodeURIComponent(`/university/${university.id}`)}`}>{tr(language, 'Войти', 'Sign in')}</Link>
          {' · '}
          <Link href="/sign-up">{tr(language, 'Создать аккаунт', 'Create account')}</Link>
        </p>
      )}
    </div>
  );
}
