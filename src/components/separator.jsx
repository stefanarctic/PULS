import React from "react";
import "../scss/components/ProblemaDetaliata.scss";

function Separator({ className = "", orientation = "horizontal", decorative = true, ...props }, ref) {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      role={decorative ? "presentation" : "separator"}
      aria-orientation={orientation}
      ref={ref}
      className={`separator ${isHorizontal ? "separator--horizontal" : "separator--vertical"} ${className}`}
      {...props}
    />
  );
}

const ForwardedSeparator = React.forwardRef(Separator);
export { ForwardedSeparator as Separator };
