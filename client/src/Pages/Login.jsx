import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import logo from '../assets/logo.svg'
import { AppContext } from '../context/appContext'

const Login = () => {
  const { login, register } = React.useContext(AppContext)
  const [state, setState] = React.useState("login")
  const [showPassword, setShowPassword] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: ''
  })
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (state === "login") {
        await login(formData.email, formData.password)
        toast.success("Welcome back! Logged in successfully.")
      } else {
        await register(formData.name, formData.email, formData.password)
        toast.success("Account created successfully! Welcome to Resumify.")
      }
      navigate('/app')
    } catch (err) {
      toast.error(err.message || "Authentication failed. Please check your details.")
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop')` }}>
      {/* Dark overlay with emerald gradient tint */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-950/95 via-slate-900/90 to-emerald-950/95 z-0"></div>

      {/* Subtle green ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-md bg-white/90 border border-white/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl transition-all duration-300">
        
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6 group">
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <img src={logo} alt="resume logo" className="h-9 w-auto mb-3" />
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {state === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-slate-500 text-sm mt-1.5">
            {state === "login" 
              ? "Build and optimize your resume with AI" 
              : "Join Resumify and land your dream job"}
          </p>
        </div>



        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {state !== "login" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block pl-1">Full Name</label>
              <div className="flex items-center bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-green-500/40 focus-within:border-green-500 h-12 rounded-full overflow-hidden pl-4 pr-2 gap-2.5 transition-all duration-300">
                <User className="size-5 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  name="name" 
                  placeholder="John Doe" 
                  className="w-full bg-transparent text-slate-800 placeholder-slate-400 border-none outline-none text-sm" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block pl-1">Email Address</label>
            <div className="flex items-center bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-green-500/40 focus-within:border-green-500 h-12 rounded-full overflow-hidden pl-4 pr-2 gap-2.5 transition-all duration-300">
              <Mail className="size-5 text-slate-400 shrink-0" />
              <input 
                type="email" 
                name="email" 
                placeholder="name@example.com" 
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 border-none outline-none text-sm" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              {state === "login" && (
                <button type="button" onClick={() => toast.error("Password reset is not configured yet.")} className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
                  Forgot password?
                </button>
              )}
            </div>
            <div className="flex items-center bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-green-500/40 focus-within:border-green-500 h-12 rounded-full overflow-hidden pl-4 pr-4 gap-2.5 transition-all duration-300">
              <Lock className="size-5 text-slate-400 shrink-0" />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="••••••••" 
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 border-none outline-none text-sm" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {state === "login" && (
            <div className="flex items-center justify-between px-1 py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-green-600 focus:ring-green-500 size-4 cursor-pointer accent-green-600" 
                  defaultChecked 
                />
                <span className="text-xs text-slate-500 font-medium">Remember me</span>
              </label>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full h-12 rounded-full text-white bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-600/20 transition-all duration-300 font-bold text-sm cursor-pointer mt-6"
          >
            {state === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Footer link */}
        <div className="mt-6 text-center text-sm">
          <p className="text-slate-500">
            {state === "login" ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => {
                setState(state === "login" ? "register" : "login")
                setFormData({ name: '', email: '', password: '' })
              }} 
              className="text-green-600 hover:text-green-700 font-bold ml-1.5 transition-colors focus:outline-none cursor-pointer"
            >
              {state === "login" ? "Sign up free" : "Sign in here"}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Login
