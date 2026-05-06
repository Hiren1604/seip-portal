import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6 fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
