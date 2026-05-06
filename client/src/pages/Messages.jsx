import { Send, Phone, Video, MoreVertical, Search } from 'lucide-react';

const conversations = [
  { id: 1, name: 'Sarah Johnson', role: 'AI & ML Expert', time: '10:42 AM', unread: 2, msg: 'Great! Let’s review the architecture tomorrow.', active: true },
  { id: 2, name: 'Rohit Verma', role: 'FinTech Specialist', time: 'Yesterday', unread: 0, msg: 'I sent over the updated financial models.', active: false },
  { id: 3, name: 'Nexus Support', role: 'Platform Team', time: 'Mon', unread: 0, msg: 'Your sandbox environment has been provisioned.', active: false },
];

export default function Messages() {
  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      
      {/* Left sidebar: Conversations */}
      <div className="w-80 bg-white rounded-2xl shadow-card border border-slate-50 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Messages</h2>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Search chats..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(chat => (
            <div key={chat.id} className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${chat.active ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {chat.name.split(' ').map(n=>n[0]).join('')}
               </div>
               <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-baseline mb-0.5">
                   <p className={`text-sm truncate ${chat.active ? 'font-bold text-primary' : 'font-semibold text-slate-800'}`}>{chat.name}</p>
                   <span className="text-[10px] font-medium text-slate-400">{chat.time}</span>
                 </div>
                 <p className={`text-xs truncate ${chat.unread > 0 ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>{chat.msg}</p>
               </div>
               {chat.unread > 0 && (
                 <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold">
                   {chat.unread}
                 </div>
               )}
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Chat interface */}
      <div className="flex-1 bg-white rounded-2xl shadow-card border border-slate-50 flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                SJ
             </div>
             <div>
               <h2 className="text-sm font-bold text-slate-800">Sarah Johnson</h2>
               <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
               </p>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"><Phone size={18} /></button>
            <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"><Video size={18} /></button>
            <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"><MoreVertical size={18} /></button>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-4">
           <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest my-2">Today</div>
           
           <div className="self-end max-w-[70%]">
             <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-sm text-sm shadow-sm">
               Hi Sarah! Thanks for accepting my mentorship request. I'm really excited to get your feedback on our AI architecture.
             </div>
             <p className="text-[10px] text-slate-400 mt-1 text-right">10:30 AM</p>
           </div>

           <div className="self-start max-w-[70%] flex items-end gap-2">
             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0 mb-4">SJ</div>
             <div>
               <div className="bg-white text-slate-700 p-3 rounded-2xl rounded-tl-sm text-sm shadow-sm border border-slate-100">
                 Hi! It's a pleasure. I looked briefly at the materials you sent over.
               </div>
               <div className="bg-white text-slate-700 p-3 rounded-2xl rounded-tl-sm text-sm shadow-sm border border-slate-100 mt-1">
                 Great! Let’s review the architecture tomorrow. I have a few suggestions regarding the data pipeline optimization.
               </div>
               <p className="text-[10px] text-slate-400 mt-1">10:42 AM</p>
             </div>
           </div>
        </div>

        {/* Chat input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 flex items-center">
              <input type="text" placeholder="Type your message..." className="bg-transparent border-none outline-none w-full text-sm text-slate-700" />
            </div>
            <button className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white shadow-md shadow-primary/30 hover:bg-indigo-600 transition-colors">
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
