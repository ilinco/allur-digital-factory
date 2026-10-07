import axios from 'axios';

export interface ParsedError {
  title: string;
  message: string;
  statusCode?: number;
  details?: string[];
  isNetworkError: boolean;
}

interface FastApiValidationErrorItem {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

export const parseApiError = (error: unknown): ParsedError => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data as
      | { detail?: unknown; message?: string }
      | undefined;

    // Network errors or timeout
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return {
          title: 'Таймаут соединения',
          message: 'Сервер завода не ответил за отведенное время. Повторите запрос позже.',
          isNetworkError: true,
        };
      }
      return {
        title: 'Ошибка связи с сервером',
        message: 'Не удалось установить соединение с сервером. Проверьте подключение к сети.',
        isNetworkError: true,
      };
    }

    // HTTP 422 - FastAPI validation errors
    if (statusCode === 422 && responseData?.detail && Array.isArray(responseData.detail)) {
      const validationItems = responseData.detail as FastApiValidationErrorItem[];
      const details = validationItems.map((item) => {
        const field = item.loc ? item.loc.filter((p) => p !== 'body').join('.') : '';
        return field ? `${field}: ${item.msg || 'некорректное значение'}` : (item.msg || 'ошибка валидации');
      });

      return {
        title: 'Ошибка валидации данных',
        message: details[0] || 'Переданы некорректные параметры запроса.',
        statusCode: 422,
        details,
        isNetworkError: false,
      };
    }

    // Extract detail string if available
    let detailMessage = '';
    if (typeof responseData?.detail === 'string') {
      detailMessage = responseData.detail;
    } else if (typeof responseData?.message === 'string') {
      detailMessage = responseData.message;
    }

    switch (statusCode) {
      case 400:
        return {
          title: 'Некорректный запрос',
          message: detailMessage || 'Сервер отклонил запрос из-за некорректных параметров.',
          statusCode: 400,
          isNetworkError: false,
        };
      case 401:
        return {
          title: 'Сессия завершена',
          message: detailMessage || 'Требуется повторный вход в систему завода.',
          statusCode: 401,
          isNetworkError: false,
        };
      case 403:
        return {
          title: 'Доступ ограничен',
          message: detailMessage || 'У вашей учетной записи недостаточно прав для данной операции.',
          statusCode: 403,
          isNetworkError: false,
        };
      case 404:
        return {
          title: 'Ресурс не найден',
          message: detailMessage || 'Запрашиваемый участок, оборудование или данные отсутствуют.',
          statusCode: 404,
          isNetworkError: false,
        };
      case 409:
        return {
          title: 'Конфликт состояния',
          message: detailMessage || 'Запрос вызвал конфликт с текущим состоянием конвейера.',
          statusCode: 409,
          isNetworkError: false,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          title: 'Сбой сервера завода',
          message: detailMessage || 'Внутренняя ошибка сервиса цифрового двойника. Попробуйте снова через минуту.',
          statusCode,
          isNetworkError: false,
        };
      default:
        return {
          title: 'Ошибка операции',
          message: detailMessage || error.message || 'Произошла непредвиденная ошибка при запросе к серверу.',
          statusCode,
          isNetworkError: false,
        };
    }
  }

  if (error instanceof Error) {
    return {
      title: 'Ошибка приложения',
      message: error.message || 'Произошла неизвестная ошибка в приложении.',
      isNetworkError: false,
    };
  }

  if (typeof error === 'string') {
    return {
      title: 'Уведомление об ошибке',
      message: error,
      isNetworkError: false,
    };
  }

  return {
    title: 'Неизвестная ошибка',
    message: 'Произошла неизвестная ошибка при выполнении операции.',
    isNetworkError: false,
  };
};
