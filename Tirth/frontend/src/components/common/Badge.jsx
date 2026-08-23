function Badge({ children, type = "default" }) {
  return (
    <span data-type={type}>
      {children}
    </span>
  );
}

export default Badge;