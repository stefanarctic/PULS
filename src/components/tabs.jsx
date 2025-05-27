import React, { useState } from "react";

// Tabs root component
export function Tabs({ defaultValue, children, className = "" }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { active, setActive })
          : child
      )}
    </div>
  );
}

// TabsList: container for triggers
export function TabsList({ children, className = "", active, setActive }) {
  return (
    <div className={`tabs-list ${className}`}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { active, setActive })
          : child
      )}
    </div>
  );
}

// TabsTrigger: a tab button
export function TabsTrigger({ value, active, setActive, children, className = "" }) {
  const isActive = active === value;
  return (
    <button
      type="button"
      className={`tabs-trigger${isActive ? " active" : ""} ${className}`}
      aria-selected={isActive}
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  );
}

// TabsContent: content for a tab
export function TabsContent({ value, active, children, className = "" }) {
  if (active !== value) return null;
  return <div className={`tabs-content ${className}`}>{children}</div>;
}
