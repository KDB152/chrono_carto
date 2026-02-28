export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {children}
    </div>
  );
}
