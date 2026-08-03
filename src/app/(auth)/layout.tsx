export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-lg border border-border/60 bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
