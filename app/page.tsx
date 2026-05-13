"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs"; // 引入 Clerk

export default function ResumePage() {
  const { user } = useUser(); // 获取当前登录用户信息
  
  // === 1. 状态管理：基础信息 ===
  const [info, setInfo] = useState({
    name: "张三",
    phone: "138-xxxx-xxxx",
    email: "example@email.com",
    target: "应届毕业生 / 产品经理",
    edu: "XX大学 | 计算机科学与技术 | 本科 | 2022.09 - 2026.06",
    skills: "• 熟练掌握 Office 办公软件，具备数据分析能力\n• 英语 CET-6 (520分)，具备良好的听说读写能力\n• 曾获校级优秀学生干部、一等奖学金",
  });

  // === 2. 状态管理：三大核心经历 ===
  const [internship, setInternship] = useState("");
  const [project, setProject] = useState("");
  const [campus, setCampus] = useState("");

  const [loadingType, setLoadingType] = useState(""); 
  const [showPayment, setShowPayment] = useState(false); // 控制收款码弹窗

  // === 3. 统一的 AI 润色处理 ===
  const handleOptimize = async (text: string, setter: any, typeName: string) => {
    if (!text) return alert(`请先输入【${typeName}】的描述哦！`);

    setLoadingType(typeName);
    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      // 如果返回 403，说明没次数了，弹出收款码
      if (response.status === 403) {
        setShowPayment(true);
        return;
      }

      const data = await response.json();
      if (data.result) {
        setter(data.result);
        user?.reload(); // 润色成功，强制刷新用户信息（更新右上角的剩余次数）
      } else {
        throw new Error("优化失败");
      }
    } catch (error) {
      alert("AI 暂时掉线了，请稍后再试");
      console.error(error);
    } finally {
      setLoadingType("");
    }
  };

  const handleInfoChange = (field: string, value: string) => {
    setInfo({ ...info, [field]: value });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      
      {/* --- 顶部导航栏 --- */}
      <nav className="max-w-7xl mx-auto mb-6 flex justify-between items-center no-print bg-white p-4 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 tracking-tight">
          RESUME <span className="text-slate-800">AI</span>
          <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full uppercase">Pro</span>
        </h1>
        
        <div className="flex items-center gap-4 md:gap-6">
          {/* 显示剩余次数 */}
          <div className="text-xs md:text-sm font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg">
            剩余次数：
            <span className="text-blue-600 text-lg ml-1">
              {user?.publicMetadata?.credits !== undefined ? String(user.publicMetadata.credits) : "3"}
            </span>
          </div>
          
          <button onClick={handlePrint} className="hidden md:block text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all active:scale-95">
            导出 PDF
          </button>
          
          {/* Clerk 用户头像组件 */}
          <UserButton/>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- 左侧：模块化编辑区 --- */}
        <div className="lg:col-span-5 space-y-6 no-print h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* 模块1：基本信息与教育 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-md font-bold text-slate-800 mb-4 border-l-4 border-blue-600 pl-2">基本信息 & 教育背景</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="姓名" value={info.name} onChange={(e) => handleInfoChange('name', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400" />
                <input placeholder="求职意向" value={info.target} onChange={(e) => handleInfoChange('target', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400" />
                <input placeholder="电话" value={info.phone} onChange={(e) => handleInfoChange('phone', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400" />
                <input placeholder="邮箱" value={info.email} onChange={(e) => handleInfoChange('email', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400" />
              </div>
              <textarea placeholder="教育背景 (学校 | 专业 | 学历 | 时间)" value={info.edu} onChange={(e) => handleInfoChange('edu', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 h-16 resize-none" />
            </div>
          </div>

          {/* 模块2：实习经历 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-md font-bold text-slate-800 mb-4 border-l-4 border-blue-600 pl-2 flex justify-between items-center">
              实习/工作经历
            </h2>
            <textarea
              value={internship} onChange={(e) => setInternship(e.target.value)}
              placeholder="例如：在XX公司担任运营实习生，主要负责..."
              className="w-full h-24 p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-400 outline-none resize-none mb-3"
            />
            <button onClick={() => handleOptimize(internship, setInternship, '实习')} disabled={loadingType === '实习'} className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-slate-800 hover:bg-black transition-all">
              {loadingType === '实习' ? "⏳ AI 正在重写..." : "✨ AI 优化经历 (扣 1 次)"}
            </button>
          </div>

          {/* 模块3：项目经历 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-md font-bold text-slate-800 mb-4 border-l-4 border-blue-600 pl-2">项目经历</h2>
            <textarea
              value={project} onChange={(e) => setProject(e.target.value)}
              placeholder="例如：参与了XX比赛或课程设计，担任队长..."
              className="w-full h-24 p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-400 outline-none resize-none mb-3"
            />
            <button onClick={() => handleOptimize(project, setProject, '项目')} disabled={loadingType === '项目'} className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-slate-800 hover:bg-black transition-all">
              {loadingType === '项目' ? "⏳ AI 正在重写..." : "✨ AI 优化经历 (扣 1 次)"}
            </button>
          </div>

          {/* 模块4：校园实践 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-md font-bold text-slate-800 mb-4 border-l-4 border-blue-600 pl-2">校园实践</h2>
            <textarea
              value={campus} onChange={(e) => setCampus(e.target.value)}
              placeholder="例如：在学生会宣传部工作，组织了迎新晚会..."
              className="w-full h-24 p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-400 outline-none resize-none mb-3"
            />
            <button onClick={() => handleOptimize(campus, setCampus, '校园')} disabled={loadingType === '校园'} className="w-full py-2.5 rounded-lg text-sm font-bold text-white bg-slate-800 hover:bg-black transition-all">
              {loadingType === '校园' ? "⏳ AI 正在重写..." : "✨ AI 优化经历 (扣 1 次)"}
            </button>
          </div>

          {/* 模块5：技能与荣誉 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-md font-bold text-slate-800 mb-4 border-l-4 border-blue-600 pl-2">技能与荣誉</h2>
            <textarea
              value={info.skills} onChange={(e) => handleInfoChange('skills', e.target.value)}
              placeholder="列出你的专业技能、语言水平、证书和荣誉奖项..."
              className="w-full h-24 p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-400 outline-none resize-none"
            />
          </div>

        </div>

        {/* --- 右侧：预览区 (标准 A4 比例) --- */}
        <div className="lg:col-span-7 print-area bg-white shadow-xl rounded-sm border-t-[12px] border-slate-800 min-h-[1050px] p-10 md:p-14 relative">
          
          {/* 简历头部 */}
          <header className="border-b-2 border-slate-800 pb-4 mb-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-wider mb-3 uppercase">{info.name || "姓名"}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-700 font-medium">
              <span>📞 {info.phone}</span>
              <span>✉️ {info.email}</span>
              <span>💼 {info.target}</span>
            </div>
          </header>

          <div className="space-y-6">
            {/* 教育背景 */}
            {info.edu && (
              <section>
                <h3 className="text-md font-bold text-slate-900 uppercase bg-slate-100 inline-block px-2 py-1 mb-3">教育背景 / Education</h3>
                <div className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed text-[15px]">
                  {info.edu}
                </div>
              </section>
            )}

            {/* 实习经历 */}
            {(internship || !internship) && (
              <section>
                <h3 className="text-md font-bold text-slate-900 uppercase bg-slate-100 inline-block px-2 py-1 mb-3">实习经历 / Internship</h3>
                {internship ? (
                  <div className="text-slate-800 whitespace-pre-wrap leading-loose font-serif text-[14px]">
                    {internship}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">暂无实习经历...</p>
                )}
              </section>
            )}

            {/* 项目经历 */}
            {project && (
              <section>
                <h3 className="text-md font-bold text-slate-900 uppercase bg-slate-100 inline-block px-2 py-1 mb-3">项目经历 / Projects</h3>
                <div className="text-slate-800 whitespace-pre-wrap leading-loose font-serif text-[14px]">
                  {project}
                </div>
              </section>
            )}

            {/* 校园经历 */}
            {campus && (
              <section>
                <h3 className="text-md font-bold text-slate-900 uppercase bg-slate-100 inline-block px-2 py-1 mb-3">校园经历 / Campus</h3>
                <div className="text-slate-800 whitespace-pre-wrap leading-loose font-serif text-[14px]">
                  {campus}
                </div>
              </section>
            )}

            {/* 技能与荣誉 */}
            {info.skills && (
              <section>
                <h3 className="text-md font-bold text-slate-900 uppercase bg-slate-100 inline-block px-2 py-1 mb-3">技能与荣誉 / Skills & Honors</h3>
                <div className="text-slate-800 whitespace-pre-wrap leading-loose text-[14px]">
                  {info.skills}
                </div>
              </section>
            )}
          </div>

        </div>

      </main>

      {/* --- 收款码弹窗 --- */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl relative">
            <button onClick={() => setShowPayment(false)} className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold text-xl">×</button>
            <h2 className="text-xl font-bold mb-2">免费额度已用完 😭</h2>
            <p className="text-sm text-slate-500 mb-6">服务器与 AI 接口成本高昂，支持一下作者吧！</p>
            
            {/* ！！！注意：你需要准备一张名为 wechat-qr.jpg 的收款码图片，放到项目的 public 文件夹下 ！！！ */}
            <img src="/wechat-qr.jpg" alt="微信收款码" className="w-48 h-48 mx-auto mb-4 border-2 border-slate-100 rounded-xl object-cover" />
            
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 font-medium">
              <p>一杯奶茶钱：<span className="text-red-500 font-black text-lg">9.9元 / 50次</span></p>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                1. 扫码支付后添加作者微信<br/> 
                2. 发送你的注册账号：<br/><b className="text-black bg-white px-1 mt-1 inline-block">{user?.primaryEmailAddress?.emailAddress}</b><br/>
                3. 作者将在 5 分钟内为你手动充值！
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 针对打印的样式控制及滚动条美化 */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          main { display: block !important; }
          .print-area {
            width: 100% !important;
            min-h: 100vh !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}