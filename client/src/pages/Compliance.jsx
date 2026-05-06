import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, Lock } from 'lucide-react';

export default function Compliance() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Compliance & Security</h1>
        <p className="text-text-secondary text-sm mt-0.5">Ensure your AI models and data handling meet industry standards.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Checklist */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-6 border border-slate-50">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-primary" size={20} /> Regulatory Checklist
            </h2>
            
            <div className="space-y-4">
              {/* Item 1 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">GDPR Data Mapping</h3>
                  <p className="text-xs text-slate-500 mt-1">All user data flows have been mapped and consent mechanisms are in place.</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">Last verified: 12 May 2024</p>
                </div>
                <button className="ml-auto text-xs font-semibold text-primary hover:underline">View Policy</button>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">AI Ethics Framework</h3>
                  <p className="text-xs text-slate-500 mt-1">Bias testing completed for core ML models. Documentation generated.</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">Last verified: 15 May 2024</p>
                </div>
                <button className="ml-auto text-xs font-semibold text-primary hover:underline">View Report</button>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">SOC 2 Type I Audit</h3>
                  <p className="text-xs text-slate-600 mt-1">Pending external review. Evidence collection is 85% complete.</p>
                  <div className="w-full bg-orange-200 rounded-full h-1.5 mt-3">
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                <button className="btn-primary ml-auto text-xs px-4 py-1.5 h-fit shadow-none bg-orange-500 hover:bg-orange-600">Resume</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6 border border-slate-50 text-center flex flex-col items-center">
             <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Lock size={32} className="text-green-600" />
             </div>
             <h3 className="text-3xl font-black text-slate-800">92/100</h3>
             <p className="text-sm font-bold text-slate-500 mt-1">Overall Security Score</p>
             <p className="text-xs text-slate-400 mt-3 px-2">Your infrastructure currently meets industry best practices for data encryption at rest and in transit.</p>
             <button className="mt-5 text-sm font-semibold text-primary w-full py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">Run Full Audit</button>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 border border-slate-50">
             <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-slate-500" /> Recent Documents
             </h3>
             <div className="space-y-3">
               {['Data Processing Agreement.pdf', 'Terms of Service v2.docx', 'Privacy Policy 2024.pdf'].map(doc => (
                 <div key={doc} className="flex items-center gap-3 group cursor-pointer">
                   <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                     <FileText size={14} className="text-slate-500 group-hover:text-primary transition-colors" />
                   </div>
                   <p className="text-xs font-medium text-slate-600 group-hover:text-primary truncate">{doc}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
