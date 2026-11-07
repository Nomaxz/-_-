import type { Language } from '../test-content';

const errorText: Record<string, { ru: string; en: string }> = {
  BAD_CREDENTIALS: { ru: 'Неверное имя пользователя или пароль.', en: 'Incorrect username or password.' },
  USERNAME_TAKEN: { ru: 'Это имя пользователя уже занято.', en: 'This username is already taken.' },
  INVALID_USERNAME: { ru: 'Имя: 3–30 символов, латинские буквы, цифры, точка, дефис или подчёркивание.', en: 'Username: 3–30 characters, Latin letters, digits, dot, hyphen or underscore.' },
  INVALID_INPUT: { ru: 'Проверьте введённые данные.', en: 'Please check the entered data.' },
  AUTH_REQUIRED: { ru: 'Сессия завершилась. Войдите снова.', en: 'Your session has ended. Please sign in again.' },
  RATE_LIMITED: { ru: 'Слишком много попыток. Подождите немного и повторите.', en: 'Too many attempts. Please wait and try again.' },
  NOT_FOUND: { ru: 'Запись не найдена. Возможно, она уже удалена.', en: 'Not found. It may already have been removed.' },
  INVALID_PROGRAM: { ru: 'Эта программа не относится к выбранному вузу.', en: 'This programme does not belong to the selected university.' },
};

export function errorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data: unknown }).data;
    if (data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string') {
      return (data as { error: string }).error;
    }
  }
  return null;
}

export function errorMessage(error: unknown, language: Language): string {
  const code = errorCode(error);
  if (code && errorText[code]) return errorText[code][language];
  return language === 'ru'
    ? 'Не удалось выполнить запрос. Проверьте соединение и повторите.'
    : 'The request failed. Check your connection and try again.';
}
