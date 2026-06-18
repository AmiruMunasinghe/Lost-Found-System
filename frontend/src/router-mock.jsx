import React, { createContext, useContext } from "react";

export const NavigationContext = createContext(null);

export function useNavigate() {
  const context = useContext(NavigationContext);
  if (!context) {
    // If not within provider yet (e.g. during initial loads / static parts)
    return () => {};
  }
  return (to, options) => {
    const params = options && options.state ? options.state : {};
    context.navigate(to, params);
  };
}

export function useLocation() {
  const context = useContext(NavigationContext);
  return {
    pathname: context ? `/${context.currentPage}` : "/",
    state: context ? context.pageParams : {},
    search: "",
    hash: ""
  };
}

export function Link({ to, children, style, className, ...props }) {
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handleClick} style={style} className={className} {...props}>
      {children}
    </a>
  );
}

export function BrowserRouter({ children }) {
  return <>{children}</>;
}

export function Routes({ children }) {
  return <>{children}</>;
}

export function Route() {
  return null;
}

export function Navigate({ to, replace }) {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(to);
  }, [to]);
  return null;
}
