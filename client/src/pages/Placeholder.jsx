import { useLocation } from 'react-router-dom';

export default function Placeholder() {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop().replace(/-/g, ' ');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
        <span className="text-4xl text-primary animate-pulse">⚙️</span>
      </div>
      <h1 className="text-3xl font-black text-text-primary capitalize mb-3">
        {pageName} Module
      </h1>
      <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
        This feature is currently under active development. Our AI is crunching data to bring you the best experience for {pageName}. Check back soon!
      </p>
      <div className="mt-8 flex gap-4">
        <button onClick={() => window.history.back()} className="btn-outline">Go Back</button>
        <button className="btn-primary">Get Notified</button>
      </div>
    </div>
  );
}
