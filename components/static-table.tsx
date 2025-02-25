export function CellLink({
  href,
  className = "",
  children,
}: {
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href || (children as string)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className || "break-all"}`}
    >
      {children}
    </a>
  );
}
