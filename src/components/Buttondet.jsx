import React from 'react';
import '../scss/components/_problema-detaliata.scss';

function Button({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}) {
  const classes = `button ${variant} size-${size} ${className}`.trim();
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export { Button };
export default Button;
