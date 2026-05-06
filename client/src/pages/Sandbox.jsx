import { Play, Code2, Server, Cpu, Activity, Terminal, CheckCircle2 } from 'lucide-react';

export default function Sandbox() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">AI Sandbox Environment</h1>
        <p className="text-text-secondary text-sm mt-0.5">Test, tune, and deploy your AI models safely.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: API Tester & Code */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-100">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 size={18} className="text-primary" />
                <span className="font-semibold text-text-primary text-sm">Model API Endpoint</span>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                </span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">POST URL</label>
                <div className="flex bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <span className="px-4 py-2.5 bg-slate-100 text-slate-500 text-sm border-r border-slate-200">POST</span>
                  <input type="text" readOnly value="https://api.nexusai.com/v1/predict" className="flex-1 bg-transparent px-3 text-sm font-mono text-slate-700 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">JSON Payload</label>
                <textarea 
                  className="w-full h-32 bg-slate-900 text-green-400 font-mono text-sm p-4 rounded-xl outline-none"
                  defaultValue={`{\n  "model": "nexus-vision-v2",\n  "input": {\n    "image_url": "https://example.com/data.png",\n    "threshold": 0.85\n  }\n}`}
                />
              </div>
              <div className="flex justify-end">
                <button className="btn-primary flex items-center gap-2 px-6">
                  <Play size={16} /> Run Inference
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-100">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 flex items-center gap-2">
              <Terminal size={18} className="text-slate-600" />
              <span className="font-semibold text-text-primary text-sm">Console Output</span>
            </div>
            <div className="p-5 bg-black h-48 overflow-y-auto">
              <p className="text-slate-400 text-xs font-mono mb-1">{`> Initializing model nexus-vision-v2...`}</p>
              <p className="text-slate-400 text-xs font-mono mb-1">{`> Loading weights from persistent storage [OK]`}</p>
              <p className="text-slate-400 text-xs font-mono mb-1">{`> GPU Allocation: 4.2GB VRAM`}</p>
              <p className="text-green-400 text-xs font-mono mt-4">{`{`}</p>
              <p className="text-green-400 text-xs font-mono ml-4">{`"status": "success",`}</p>
              <p className="text-green-400 text-xs font-mono ml-4">{`"inference_time_ms": 142,`}</p>
              <p className="text-green-400 text-xs font-mono ml-4">{`"predictions": [`}</p>
              <p className="text-green-400 text-xs font-mono ml-8">{`{"label": "Document", "confidence": 0.98}`}</p>
              <p className="text-green-400 text-xs font-mono ml-4">{`]`}</p>
              <p className="text-green-400 text-xs font-mono">{`}`}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Server Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-5">
            <p className="font-bold text-text-primary text-sm mb-4">Resource Utilization</p>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600 flex items-center gap-1"><Cpu size={14} /> CPU Load</span>
                  <span className="text-text-primary">42%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '42%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600 flex items-center gap-1"><Server size={14} /> GPU VRAM</span>
                  <span className="text-text-primary">8.4 / 16 GB</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: '52%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600 flex items-center gap-1"><Activity size={14} /> Memory</span>
                  <span className="text-text-primary">12 / 32 GB</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '37%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-5">
            <p className="font-bold text-text-primary text-sm mb-4">Recent Deployments</p>
            <div className="space-y-4">
              {[1,2,3].map((i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-text-primary">nexus-vision-v{4-i}</p>
                    <p className="text-[10px] text-text-secondary">Production • {i} day(s) ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
