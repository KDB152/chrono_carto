export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-blue-200">Chargement...</p>
      </div>
    </div>
  );
}
