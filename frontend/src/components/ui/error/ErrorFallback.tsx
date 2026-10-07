import { useState } from 'react';
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconRefresh,
  IconRotateDot,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

export const ErrorFallback = ({ error, onReset }: ErrorFallbackProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
        {/* Semantic Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <IconAlertTriangle size={26} stroke={1.75} />
        </div>

        {/* Title & Description */}
        <h2 className="mt-4 text-base font-bold text-slate-900">
          Сбой в работе интерфейса
        </h2>
        <p className="mt-1.5 text-xs font-medium text-slate-600">
          Система зафиксировала непредвиденную ошибку при отображении модуля.
          Вы можете повторить попытку или перезагрузить страницу.
        </p>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={onReset}
            leftIcon={<IconRotateDot size={16} />}
          >
            Повторить попытку
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => window.location.reload()}
            leftIcon={<IconRefresh size={16} />}
          >
            Перезагрузить
          </Button>
        </div>

        {/* Collapsible Details */}
        {error && (
          <div className="mt-6 border-t border-slate-100 pt-4 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex w-full items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <span>Технические подробности</span>
              {showDetails ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )}
            </button>

            {showDetails && (
              <div className="mt-2.5 max-h-48 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-700">
                <p className="font-semibold text-rose-700">{error.name}: {error.message}</p>
                {error.stack && (
                  <pre className="mt-2 whitespace-pre-wrap text-[10px] text-slate-500">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
