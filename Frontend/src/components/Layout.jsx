import Sidebar from './Sidebar';

const Layout = ({ children, user, onLogout }) => {
    return (
        <div className="flex h-screen overflow-hidden font-sans text-gray-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0f172a] to-black">
            {/* Ambient background glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

            <Sidebar user={user} onLogout={onLogout} />

            <main className="flex-1 overflow-y-auto relative z-10 w-full h-full">
                <div className="max-w-7xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
