import { IconAlertCircle, IconRotateDot } from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorCard = ({
  title = 'Не удалось загрузить данные',
  message = 'Проверьте соединение с API цифрового двойника и повторите попытку.',
  onRetry,
  className = '',
}: ErrorCardProps) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs ${className}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
        <IconAlertCircle size={22} stroke={2} />
      </div>

      <h3 className="mt-3 text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-xs font-medium text-slate-500">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="primary"
          size="sm"
          onClick={onRetry}
          leftIcon={<IconRotateDot size={14} />}
          className="mt-4"
        >
          Повторить попытку
        </Button>
      )}
    </div>
  );
};
