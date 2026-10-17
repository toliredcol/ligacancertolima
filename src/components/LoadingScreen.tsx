export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-red-600 animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Cargando...</p>
      </div>
    </div>
  );
}
