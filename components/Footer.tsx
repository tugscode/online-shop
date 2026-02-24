export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-gray-400 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-2xl font-bold text-white mb-2">Coziness</p>
        <p className="text-sm">© {year} Coziness. Бүх эрх хуулиар хамгаалагдсан.</p>
      </div>
    </footer>
  )
}