import { Link } from "react-router-dom";
import { ArrowRight, Building2, ShieldCheck, Users, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui";

export default function Landing() {
  const features = [
    {
      title: "Smart Visitor Management",
      description: "Pre-approve visitors with QR codes, track walk-ins, and secure your gates digitally.",
      icon: ShieldCheck,
      color: "text-primary",
      bg: "bg-primary-light",
    },
    {
      title: "Automated Billing & Dues",
      description: "Generate maintenance invoices automatically, collect payments, and track defaulters.",
      icon: Zap,
      color: "text-warning",
      bg: "bg-warning-light",
    },
    {
      title: "Seamless Communication",
      description: "Broadcast notices instantly, run polls, and connect residents with management.",
      icon: Users,
      color: "text-success",
      bg: "bg-success-light",
    },
  ];

  const benefits = [
    "No hidden costs or setup fees",
    "Bank-grade security and data privacy",
    "24/7 dedicated customer support",
    "Multi-platform access (Web & Mobile)",
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-light/40 via-background to-background" />
        
        <div className="max-w-7xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light/50 border border-primary/20 text-primary text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            SocietySphere 2.0 is now live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-text tracking-tight mb-8">
            Modernize your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              society management
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted mb-10 leading-relaxed">
            The all-in-one SaaS platform for residential communities. Handle billing, visitors, complaints, and amenities seamlessly from one unified dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register-society">
              <Button size="lg" className="w-full sm:w-auto font-semibold px-8 h-14 text-base">
                Start your free trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold px-8 h-14 text-base bg-surface">
                Sign in to workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text mb-4">Everything you need to run your society</h2>
            <p className="text-muted max-w-2xl mx-auto">
              Replace fragmented WhatsApp groups, Excel sheets, and legacy software with our comprehensive, modern platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className={`h-14 w-14 rounded-xl flex items-center justify-center mb-6 ${feature.bg}`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-text mb-3">{feature.title}</h3>
                <p className="text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 md:p-16 overflow-hidden relative shadow-xl">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
              <Building2 className="h-96 w-96 text-white" />
            </div>
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to upgrade your residential experience?
                </h2>
                <p className="text-primary-light mb-8 text-lg">
                  Join hundreds of communities that trust SocietySphere to automate their daily operations.
                </p>
                
                <ul className="space-y-4 mb-8">
                  {benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-white">
                      <CheckCircle2 className="h-5 w-5 text-success-light mr-3 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/register-society">
                  <Button size="lg" className="bg-white text-primary hover:bg-slate-50 font-bold border-transparent">
                    Create Society Account
                  </Button>
                </Link>
              </div>
              
              <div className="hidden lg:block relative h-full">
                {/* Abstract mock UI representation */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[120%] bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl rotate-2">
                  <div className="flex gap-4 mb-6">
                    <div className="h-3 w-3 rounded-full bg-danger" />
                    <div className="h-3 w-3 rounded-full bg-warning" />
                    <div className="h-3 w-3 rounded-full bg-success" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-white/20 rounded w-1/3" />
                    <div className="h-32 bg-white/10 rounded-xl" />
                    <div className="flex gap-4">
                      <div className="h-24 bg-white/10 rounded-xl flex-1" />
                      <div className="h-24 bg-white/10 rounded-xl flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
