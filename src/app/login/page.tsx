import { login, signup } from './actions'

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans">
            <div className="p-10 bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-indigo-200 shadow-lg">✝</div>
                    <h1 className="text-3xl font-extrabold text-slate-900 text-center">Đăng Nhập</h1>
                    <p className="text-slate-500 text-sm mt-2">Hệ thống Quản lý Hội Thánh Toronto</p>
                </div>
                
                <form className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">Email</label>
                        <input
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">Mật khẩu</label>
                        <input
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            id="password"
                            name="password"
                            type="password"
                            required
                        />
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            className="w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
                            formAction={login}
                        >
                            Đăng Nhập
                        </button>
                        <button
                            className="w-full bg-slate-100 text-slate-600 font-semibold py-3.5 px-4 rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]"
                            formAction={signup}
                        >
                            Đăng Ký Tài Khoản
                        </button>
                    </div>
                    
                    <div className="text-center mt-6">
                        <a href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                            ← Quay lại Trang chủ
                        </a>
                    </div>
                </form>
            </div>
        </div>
    )
}
