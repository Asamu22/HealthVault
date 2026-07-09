import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        { 'btn-loading': loading },
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {icon ? <span className="btn-icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
