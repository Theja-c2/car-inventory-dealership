import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="bg-charcoal text-paper border-b-4 border-amber">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber flex items-center justify-center">
            <span className="font-display font-bold text-charcoal text-lg">D</span>
          </div>
          <div>
            <h1 className="font-display text-xl tracking-wide uppercase leading-none">Dealership Lot</h1>
            <p className="text-[11px] text-paper/60 font-mono tracking-widest uppercase">Inventory System</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-[11px] font-mono uppercase tracking-wider text-amber">
                {isAdmin ? 'Admin' : 'Customer'}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm font-medium border border-paper/30 rounded hover:bg-paper/10 transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
