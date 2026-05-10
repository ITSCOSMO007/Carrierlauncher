export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}