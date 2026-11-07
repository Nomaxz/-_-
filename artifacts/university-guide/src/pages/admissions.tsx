import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearch } from 'wouter';
import { ArrowUpRight, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  useCreateCampassPlan,
  useCreateCampassStep,
  useDeleteCampassPlan,
  useDeleteCampassStep,
  useUpdateCampassPlan,
  useUpdateCampassStep,
  type CampassPlan,
  type CampassStep,
  type CampassUser,
} from '@workspace/api-client-react';
import { checklistTemplates, getProgrammes } from '@workspace/campass-data';
import { useToast } from '@/hooks/use-toast';
import { getCountryName, universities, type University } from '../catalog';
import { tr, useLanguage } from '../language';
import { errorMessage } from '../features/api-errors';
import { PrivateGate } from '../features/private-gate';
import { useInvalidatePrivate, usePlans } from '../features/session';
import { UniversitySearch } from '../features/university-search';
import { getUniversityInsight } from '../university-insights';

const byId = new Map(universities.map((item) => [item.id, item]));
const OTHER = '__other__';

function useFail() {
  const { toast } = useToast();
  const { language } = useLanguage();
  return (title: string, error: unknown) => toast({ title, description: errorMessage(error, language), variant: 'destructive' });
}

function ProgrammePicker({ university, programId, programName, onChange }: {
  university: University | undefined;
  programId: string;
  programName: string;
  onChange: (next: { programId: string; programName: string }) => void;
}) {
  const { language } = useLanguage();
  const list = university ? getProgrammes(university) : [];
  return (
    <div className="programme-picker">
      {list.length > 0 && (
        <div className="field">
          <label htmlFor="programme-select">{tr(language, 'Программа из выборки', 'Programme from sample')}</label>
          <select id="programme-select" className="control" value={programId || OTHER} onChange={(e) => onChange({ programId: e.target.value === OTHER ? '' : e.target.value, programName })} data-testid="select-programme">
            {list.map((p) => <option key={p.id} value={p.id}>{p.title[language]}</option>)}
            <option value={OTHER}>{tr(language, 'Другая — ввести вручную', 'Other — type it in')}</option>
          </select>
        </div>
      )}
      {(!programId || !list.length) && (
        <div className="field">
          <label htmlFor="programme-name">{tr(language, 'Название программы (необязательно)', 'Programme name (optional)')}</label>
          <input id="programme-name" className="control" maxLength={200} value={programName} onChange={(e) => onChange({ programId: '', programName: e.target.value })} placeholder={tr(language, 'Например, Economics BSc', 'e.g. Economics BSc')} data-testid="input-programme-name" />
        </div>
      )}
    </div>
  );
}

function NewPlanForm({ plans }: { plans: CampassPlan[] }) {
  const { language } = useLanguage();
  const search = useSearch();
  const preset = new URLSearchParams(search).get('university');
  const [picked, setPicked] = useState<University | undefined>(() => (preset ? byId.get(preset) : undefined));
  const [programme, setProgramme] = useState({ programId: '', programName: '' });
  const create = useCreateCampassPlan();
  const invalidate = useInvalidatePrivate();
  const fail = useFail();
  const { toast } = useToast();
  const existing = picked ? plans.find((p) => p.universityId === picked.id) : undefined;

  useEffect(() => { if (preset && byId.get(preset)) setPicked(byId.get(preset)); }, [preset]);
  useEffect(() => {
    const list = picked ? getProgrammes(picked) : [];
    setProgramme({ programId: list[0]?.id ?? '', programName: '' });
  }, [picked]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!picked || create.isPending) return;
    if (existing) { document.getElementById(`plan-${existing.id}`)?.scrollIntoView({ behavior: 'smooth' }); return; }
    const chosen = picked ? getProgrammes(picked).find((p) => p.id === programme.programId) : undefined;
    try {
      await create.mutateAsync({ data: {
        universityId: picked.id,
        ...(chosen ? { programId: chosen.id, programName: chosen.title.en } : programme.programName.trim() ? { programName: programme.programName.trim() } : {}),
      } });
      await invalidate('plans');
      toast({ title: tr(language, 'План создан и сохранён', 'Plan created and saved') });
      setPicked(undefined);
    } catch (error) { fail(tr(language, 'План не создан', 'Plan not created'), error); }
  };

  return (
    <form className="plan-new" onSubmit={submit}>
      <h2 className="section-title">{tr(language, 'Новый план', 'New plan')}</h2>
      {picked ? (
        <div className="picked">
          <div><strong data-testid="text-picked-university">{picked.name}</strong><div className="uni-loc">{getCountryName(picked, language)}</div></div>
          <button type="button" className="link-button" onClick={() => setPicked(undefined)} data-testid="button-change-university">{tr(language, 'Выбрать другой', 'Choose another')}</button>
        </div>
      ) : (
        <UniversitySearch label={tr(language, 'Университет из каталога', 'University from the directory')} testId="plan-search" onPick={setPicked} />
      )}
      {picked && !existing && <ProgrammePicker university={picked} programId={programme.programId} programName={programme.programName} onChange={setProgramme} />}
      {existing && <p className="coverage-note" data-testid="text-plan-exists">{tr(language, 'План для этого вуза уже есть — прогресс сохранён ниже.', 'A plan for this university already exists — progress is kept below.')}</p>}
      <button type="submit" className="button" disabled={!picked || create.isPending} data-testid="button-create-plan">
        {create.isPending ? tr(language, 'Создаём…', 'Creating…') : existing ? tr(language, 'Перейти к плану', 'Go to plan') : tr(language, 'Создать план', 'Create plan')}
      </button>
    </form>
  );
}

function StepRow({ plan, step }: { plan: CampassPlan; step: CampassStep }) {
  const { language } = useLanguage();
  const update = useUpdateCampassStep();
  const remove = useDeleteCampassStep();
  const invalidate = useInvalidatePrivate();
  const fail = useFail();
  const template = step.templateKey ? checklistTemplates.find((t) => t.key === step.templateKey) : undefined;
  const label = template ? template.label[language] : step.label;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const busy = update.isPending || remove.isPending;

  const toggle = async () => {
    try { await update.mutateAsync({ id: plan.id, stepId: step.id, data: { done: !step.done } }); await invalidate('plans'); }
    catch (error) { fail(tr(language, 'Отметка не сохранена', 'Check not saved'), error); }
  };
  const saveLabel = async (event: FormEvent) => {
    event.preventDefault();
    const next = draft.trim();
    if (!next) return;
    try { await update.mutateAsync({ id: plan.id, stepId: step.id, data: { label: next } }); await invalidate('plans'); setEditing(false); }
    catch (error) { fail(tr(language, 'Текст не сохранён', 'Label not saved'), error); }
  };
  const del = async () => {
    try { await remove.mutateAsync({ id: plan.id, stepId: step.id }); await invalidate('plans'); }
    catch (error) { fail(tr(language, 'Шаг не удалён', 'Step not removed'), error); }
  };

  return (
    <li className={`step ${step.done ? 'done' : ''}`} data-testid={`step-${step.id}`}>
      <button type="button" className="step-check" role="checkbox" aria-checked={step.done} onClick={toggle} disabled={busy} data-testid={`checkbox-step-${step.id}`}>
        {step.done && <Check size={14} aria-hidden="true" />}
      </button>
      {editing ? (
        <form className="step-edit" onSubmit={saveLabel}>
          <input className="control" value={draft} maxLength={500} onChange={(e) => setDraft(e.target.value)} autoFocus data-testid={`input-step-label-${step.id}`} />
          <button type="submit" className="chip-button" disabled={busy || !draft.trim()} data-testid={`button-save-step-${step.id}`}>{tr(language, 'Сохранить', 'Save')}</button>
          <button type="button" className="chip-button" onClick={() => { setEditing(false); setDraft(label); }}><X size={13} aria-hidden="true" /></button>
        </form>
      ) : (
        <span className="step-label">{label}{template && <em className="step-kind">{tr(language, 'общий шаг', 'general step')}</em>}</span>
      )}
      {!editing && (
        <span className="step-tools">
          <button type="button" className="icon-button" onClick={() => { setDraft(label); setEditing(true); }} aria-label={tr(language, 'Изменить', 'Edit')} data-testid={`button-edit-step-${step.id}`}><Pencil size={14} /></button>
          <button type="button" className="icon-button" onClick={del} disabled={busy} aria-label={tr(language, 'Удалить шаг', 'Delete step')} data-testid={`button-delete-step-${step.id}`}><Trash2 size={14} /></button>
        </span>
      )}
    </li>
  );
}

function PlanCard({ plan }: { plan: CampassPlan }) {
  const { language } = useLanguage();
  const university = byId.get(plan.universityId);
  const insight = university ? getUniversityInsight(university) : null;
  const programme = university && plan.programId ? getProgrammes(university).find((p) => p.id === plan.programId) : undefined;
  const done = plan.steps.filter((s) => s.done).length;
  const total = plan.steps.length;
  const updatePlan = useUpdateCampassPlan();
  const deletePlan = useDeleteCampassPlan();
  const addStep = useCreateCampassStep();
  const invalidate = useInvalidatePrivate();
  const fail = useFail();
  const { toast } = useToast();
  const [editingProgramme, setEditingProgramme] = useState(false);
  const [draft, setDraft] = useState({ programId: plan.programId ?? '', programName: plan.programId ? '' : plan.programName });
  const [newStep, setNewStep] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveProgramme = async (event: FormEvent) => {
    event.preventDefault();
    const chosen = university ? getProgrammes(university).find((p) => p.id === draft.programId) : undefined;
    try {
      await updatePlan.mutateAsync({ id: plan.id, data: chosen ? { programId: chosen.id, programName: chosen.title.en } : { programId: null, programName: draft.programName.trim() } });
      await invalidate('plans');
      setEditingProgramme(false);
      toast({ title: tr(language, 'Программа обновлена, отметки сохранены', 'Programme updated, progress kept') });
    } catch (error) { fail(tr(language, 'Программа не сохранена', 'Programme not saved'), error); }
  };
  const submitStep = async (event: FormEvent) => {
    event.preventDefault();
    const label = newStep.trim();
    if (!label || addStep.isPending) return;
    try { await addStep.mutateAsync({ id: plan.id, data: { label } }); await invalidate('plans'); setNewStep(''); }
    catch (error) { fail(tr(language, 'Шаг не добавлен', 'Step not added'), error); }
  };
  const removePlan = async () => {
    try { await deletePlan.mutateAsync({ id: plan.id }); await invalidate('plans'); toast({ title: tr(language, 'План удалён', 'Plan deleted') }); }
    catch (error) { fail(tr(language, 'План не удалён', 'Plan not deleted'), error); setConfirmDelete(false); }
  };

  return (
    <article className="plan-card" id={`plan-${plan.id}`} data-testid={`plan-${plan.id}`}>
      <header className="plan-head">
        <div>
          {university ? <Link href={`/university/${plan.universityId}`} className="plan-title">{plan.universityName}</Link> : <span className="plan-title">{plan.universityName}</span>}
          <div className="uni-loc">{university ? getCountryName(university, language) : plan.countryCode}</div>
        </div>
        <div className="plan-progress" data-testid={`text-progress-${plan.id}`}>
          <strong>{done}/{total}</strong>
          <span>{tr(language, 'выполнено', 'done')}</span>
          <div className="progress-track"><div className="progress-fill" style={{ transform: `scaleX(${total ? done / total : 0})` }} /></div>
        </div>
      </header>

      <div className="plan-programme">
        <span className="field-label">{tr(language, 'Программа', 'Programme')}</span>
        {editingProgramme ? (
          <form onSubmit={saveProgramme} className="plan-programme-form">
            <ProgrammePicker university={university} programId={draft.programId} programName={draft.programName} onChange={setDraft} />
            <div className="action-row">
              <button type="submit" className="button" disabled={updatePlan.isPending} data-testid={`button-save-programme-${plan.id}`}>{updatePlan.isPending ? tr(language, 'Сохраняем…', 'Saving…') : tr(language, 'Сохранить', 'Save')}</button>
              <button type="button" className="button secondary" onClick={() => setEditingProgramme(false)}>{tr(language, 'Отмена', 'Cancel')}</button>
            </div>
          </form>
        ) : (
          <div className="plan-programme-view">
            {programme ? <a href={programme.source} target="_blank" rel="noreferrer" data-testid={`link-programme-${plan.id}`}>{programme.title[language]} <ArrowUpRight size={13} aria-hidden="true" /></a>
              : plan.programName ? <span>{plan.programName} <small className="muted-note">{tr(language, '(указано вами, не проверено)', '(entered by you, not verified)')}</small></span>
              : <span className="unknown">{tr(language, 'Не выбрана', 'Not selected')}</span>}
            <button type="button" className="link-button" onClick={() => { setDraft({ programId: plan.programId ?? '', programName: plan.programId ? '' : plan.programName }); setEditingProgramme(true); }} data-testid={`button-edit-programme-${plan.id}`}>{tr(language, 'Изменить', 'Change')}</button>
          </div>
        )}
      </div>

      <details className="plan-info">
        <summary>{tr(language, 'Сведения о поступлении', 'Admissions information')}{insight ? (insight.approximate ? tr(language, ' · ориентир по стране', ' · country guide') : tr(language, ' · по данным вуза', ' · university source')) : ''}</summary>
        {insight ? (
          <>
            <p>{insight.admission[language] || tr(language, 'Подтверждённые требования этой программы пока не добавлены. Уточните список на официальном сайте вуза.', 'Verified requirements for this programme have not yet been added. Confirm them on the university website.')}</p>
            {insight.application && <p><strong>{tr(language, 'Подача и сроки', 'Application and deadlines')}:</strong> {insight.application[language]}</p>}
            <ul className="source-list">{insight.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ul>
          </>
        ) : <p className="unknown">{tr(language, 'Проверенных сведений о поступлении нет. Смотрите официальный сайт вуза.', 'No verified admissions information. See the official university website.')}</p>}
      </details>

      <p className="checklist-note">{tr(language, 'Общий организационный чек-лист — это не проверенные требования вуза. Удаляйте лишние шаги.', 'General organisational checklist — not verified university requirements. Delete steps that do not apply.')}</p>
      {plan.steps.length ? (
        <ul className="step-list">{plan.steps.map((step) => <StepRow key={step.id} plan={plan} step={step} />)}</ul>
      ) : <p className="muted-line">{tr(language, 'Шагов нет. Добавьте свой.', 'No steps. Add your own.')}</p>}

      <form className="step-add" onSubmit={submitStep}>
        <input className="control" value={newStep} maxLength={500} onChange={(e) => setNewStep(e.target.value)} placeholder={tr(language, 'Свой шаг, например: записаться на IELTS', 'Your own step, e.g. book IELTS')} data-testid={`input-new-step-${plan.id}`} />
        <button type="submit" className="button secondary" disabled={!newStep.trim() || addStep.isPending} data-testid={`button-add-step-${plan.id}`}><Plus size={14} aria-hidden="true" /> {tr(language, 'Добавить', 'Add')}</button>
      </form>

      <footer className="plan-foot">
        {confirmDelete ? (
          <div className="confirm-row" role="alert">
            <span>{tr(language, `Удалить план и весь прогресс (${done}/${total})?`, `Delete the plan and all progress (${done}/${total})?`)}</span>
            <button type="button" className="chip-button danger" onClick={removePlan} disabled={deletePlan.isPending} data-testid={`button-confirm-delete-${plan.id}`}>{deletePlan.isPending ? tr(language, 'Удаляем…', 'Deleting…') : tr(language, 'Да, удалить', 'Yes, delete')}</button>
            <button type="button" className="chip-button" onClick={() => setConfirmDelete(false)} data-testid={`button-cancel-delete-${plan.id}`}>{tr(language, 'Отмена', 'Cancel')}</button>
          </div>
        ) : (
          <button type="button" className="link-button danger" onClick={() => setConfirmDelete(true)} data-testid={`button-delete-plan-${plan.id}`}>{tr(language, 'Удалить план', 'Delete plan')}</button>
        )}
      </footer>
    </article>
  );
}

function AdmissionsBody({ user }: { user: CampassUser }) {
  const { language } = useLanguage();
  const plans = usePlans(user.id);
  const list = useMemo(() => plans.data ?? [], [plans.data]);
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && list.length) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [list.length]);

  return (
    <div className="page">
      <div className="eyebrow">{tr(language, 'Подготовка к поступлению', 'Admissions preparation')}</div>
      <h1 className="page-title">{tr(language, 'Мои планы', 'My plans')}</h1>
      <p className="intro">{tr(language, 'Один план на вуз. Отметки сохраняются на сервере сразу.', 'One plan per university. Checks are saved to the server immediately.')}</p>
      <div className="admissions-layout">
        <NewPlanForm plans={list} />
        <div>
          {plans.isLoading ? (
            <><div className="skeleton-block tall" /><div className="skeleton-block tall" /></>
          ) : plans.isError ? (
            <div className="empty-state" data-testid="state-plans-error"><h2>{errorMessage(plans.error, language)}</h2><button type="button" className="button secondary" onClick={() => plans.refetch()} data-testid="button-retry-plans">{tr(language, 'Повторить', 'Retry')}</button></div>
          ) : list.length ? (
            <div className="plan-list" data-testid="list-plans">{list.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</div>
          ) : (
            <div className="empty-state" data-testid="empty-plans">
              <h2>{tr(language, 'Планов пока нет', 'No plans yet')}</h2>
              <p>{tr(language, 'Найдите вуз слева или нажмите «В план подготовки» в каталоге.', 'Find a university on the left or press “Add to plan” in the directory.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdmissionsPage() {
  const { language } = useLanguage();
  return (
    <PrivateGate path="/admissions" title={tr(language, 'Планы поступления', 'Admissions plans')}
      reason={tr(language, 'Войдите, чтобы вести чек-листы подготовки по выбранным вузам. Прогресс хранится в вашем аккаунте.', 'Sign in to keep preparation checklists for chosen universities. Progress is stored in your account.')}>
      {(user) => <AdmissionsBody user={user} />}
    </PrivateGate>
  );
}
