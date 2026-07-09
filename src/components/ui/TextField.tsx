import { InputHTMLAttributes, ReactNode } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  error?: string;
};

export function TextField({
  label,
  helperText,
  startIcon,
  endIcon,
  error,
  id,
  className,
  ...props
}: TextFieldProps) {
  const inputId = id || label.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className={['text-field', error ? 'text-field-error' : ''].join(' ')}>
      <label htmlFor={inputId} className="text-field-label">
        {label}
      </label>
      <div className="text-field-control">
        {startIcon ? <span className="text-field-icon text-field-icon-start">{startIcon}</span> : null}
        <input id={inputId} className="text-field-input" {...props} />
        {endIcon ? <span className="text-field-icon text-field-icon-end">{endIcon}</span> : null}
      </div>
      {error ? <p className="text-field-error-text">{error}</p> : helperText ? <p className="text-field-helper-text">{helperText}</p> : null}
    </div>
  );
}
