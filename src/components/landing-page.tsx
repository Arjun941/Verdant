import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  BarChart3, 
  Brain, 
  Shield, 
  Smartphone, 
  TrendingUp,
  DollarSign,
  PieChart,
  Target,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { motion } from 'framer-motion';

export function LandingPage() {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleOnHover = {
    whileHover: { 
      scale: 1.05,
      transition: { type: "spring", stiffness: 300, damping: 10 }
    },
    whileTap: { scale: 0.95 }
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Categorization",
      description: "Smart AI automatically categorizes your transactions, saving you time and ensuring accuracy."
    },
    {
      icon: BarChart3,
      title: "Intelligent Insights",
      description: "Get personalized financial insights and spending patterns powered by advanced analytics."
    },
    {
      icon: Zap,
      title: "Instant Transaction Import",
      description: "Quickly import transactions from CSV files or add them manually with our intuitive interface."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data is encrypted and secure with enterprise-grade Firebase security."
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Beautiful, responsive design that works perfectly on all your devices."
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Track your spending trends and financial goals with real-time charts and visualizations."
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Save Money",
      description: "Identify unnecessary expenses and optimize your spending habits"
    },
    {
      icon: PieChart,
      title: "Clear Overview",
      description: "Visualize where your money goes with beautiful charts and breakdowns"
    },
    {
      icon: Target,
      title: "Reach Goals",
      description: "Set and track financial goals with intelligent recommendations"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Manager",
      content: "Verdant has completely transformed how I manage my finances. The AI categorization is incredibly accurate!",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Software Engineer",
      content: "Finally, an expense tracker that actually understands my spending patterns. The insights are game-changing.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Small Business Owner",
      content: "The CSV import feature saved me hours of manual entry. Verdant makes financial tracking effortless.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Logo />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <Link href="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost">Sign In</Button>
                </motion.div>
              </Link>
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button>Get Started</Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            >
              <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="mr-2 h-4 w-4" />
                AI-Powered Financial Tracking
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            >
              Effortless{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Expense
              </span>{' '}
              Tracking
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl"
            >
              Transform your financial life with intelligent expense categorization, 
              real-time insights, and beautiful visualizations. Let AI handle the complexity 
              while you focus on what matters.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <motion.div {...scaleOnHover}>
                  <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                    Start Free Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/login">
                <motion.div {...scaleOnHover}>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                    Sign In
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl"
          ></motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Powerful Features for Modern Finance
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to take control of your finances with cutting-edge AI technology.
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  y: -10,
                  transition: { type: "spring", stiffness: 300, damping: 10 }
                }}
              >
                <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"
                        whileHover={{ 
                          rotate: 360,
                          transition: { duration: 0.6, ease: "easeInOut" }
                        }}
                      >
                        <feature.icon className="h-6 w-6" />
                      </motion.div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-32 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose Verdant?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who have transformed their financial habits with our intelligent platform.
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                className="text-center"
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="flex justify-center mb-6"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { type: "spring", stiffness: 300, damping: 10 }
                  }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <benefit.icon className="h-8 w-8" />
                  </div>
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Loved by Thousands
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our users are saying about their Verdant experience.
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  y: -10,
                  transition: { type: "spring", stiffness: 300, damping: 10 }
                }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
                  <CardHeader>
                    <motion.div 
                      className="flex items-center gap-1 mb-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
                          viewport={{ once: true }}
                        >
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </motion.div>
                    <CardDescription className="text-base leading-relaxed">
                      "{testimonial.content}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to Transform Your Finances?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who have already taken control of their financial future with Verdant.
            </p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <motion.div {...scaleOnHover}>
                  <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
              className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>No credit card required</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Free forever plan</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Setup in under 2 minutes</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Logo />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-4 md:mt-0 text-sm text-muted-foreground"
            >
              © 2025 Verdant. All rights reserved.
            </motion.div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
