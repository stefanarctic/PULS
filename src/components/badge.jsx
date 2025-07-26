import React from "react";
import "../scss/components/ProblemaDetaliata.scss";

function Badge({ className = "", variant = "default", ...props }) {
  return (
    <div className={`badge badge--${variant} ${className}`} {...props} />
  );
}

export { Badge };
