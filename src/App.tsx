export default function App() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="bg-surface border border-border rounded-lg p-8 max-w-md">
        <h1 className="text-3xl mb-2">Nex Books</h1>
        <p className="text-fg/80 mb-4">Tailwind + tokens working.</p>
        <button className="bg-primary text-on-primary px-4 py-2 rounded transition-transform duration-120 active:scale-[0.97] cursor-pointer">
          Primary CTA
        </button>
      </div>
    </main>
  )
}
