import Link from 'next/link'
import { LogoutButton } from './TaskActions'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xl">🧹</span>
        <span className="text-lg font-bold text-gray-900">CleanSync</span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          className="text-gray-500 hover:text-gray-700 p-2 rounded-lg transition-colors"
          title="Einstellungen"
        >
          <span className="text-lg">⚙️</span>
        </Link>
        <LogoutButton />
        <Link
          href="/tasks/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          + Auftrag
        </Link>
      </div>
    </header>
  )
}
