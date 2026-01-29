import type React from 'react';
import { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { FileText, Shield, Zap, Users, CheckCircle, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthPage: React.FC = () => {
  // Check localStorage flags to determine initial state
  const showSignup = localStorage.getItem('show_signup') === 'true';
  const showLogin = localStorage.getItem('show_login') === 'true';

  const [isLogin, setIsLogin] = useState(!showSignup);
  const { continueAsGuest } = useAuth();

  // Clear the flags after reading them
  useEffect(() => {
    if (showSignup) {
      localStorage.removeItem('show_signup');
      setIsLogin(false);
    } else if (showLogin) {
      localStorage.removeItem('show_login');
      setIsLogin(true);
    }
  }, [showSignup, showLogin]);

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary opacity-50"></div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-gradient-to-r from-accent to-accent-dark p-3 rounded-2xl mr-4 shadow-lg shadow-glow">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
                CV Builder
              </h1>
            </div>
            <p className="text-2xl font-semibold text-text-secondary mb-2 max-w-2xl mx-auto">
              Create your profile in 5 minutes and be discovered
            </p>
            <p className="text-lg text-text-muted mb-6 max-w-2xl mx-auto">
              Download Your CV Instantly and Use It Anywhere
            </p>
            <div className="flex justify-center items-center space-x-6 text-sm text-text-muted">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-accent" />
                <span>10,000+ users</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1 text-accent" />
                <span>ATS-friendly</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1 text-accent" />
                <span>Quick & Easy</span>
              </div>
            </div>
          </div>

          {/* Auth Forms */}
          <div className="max-w-md mx-auto mb-16">
            {isLogin ? (
              <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
            )}

            {/* Guest Mode Button */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-primary text-text-muted">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={continueAsGuest}
                className="mt-4 w-full flex items-center justify-center px-6 py-3 border border-border rounded-lg text-text-secondary glass-card hover:bg-secondary-light transition-all duration-200 group"
              >
                <span>Continue as Guest</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="mt-3 text-center text-xs text-text-muted">
                Try the app without signing up. Your data will be stored locally.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-secondary py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Why Choose Our CV Builder?
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Join thousands of professionals who landed their dream jobs with our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6 rounded-2xl glass-card hover:border-accent transition-all duration-300 hover-lift">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-accent-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-glow">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Professional Templates
              </h3>
              <p className="text-text-muted leading-relaxed">
                Choose from beautifully designed, industry-specific templates that pass ATS screening and impress hiring managers.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl glass-card hover:border-accent transition-all duration-300 hover-lift">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-accent-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-glow">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">
                ATS Optimization
              </h3>
              <p className="text-text-muted leading-relaxed">
                Real-time ATS compatibility checking ensures your CV gets through automated screening systems.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl glass-card hover:border-accent transition-all duration-300 hover-lift">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-accent-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Smart Suggestions
              </h3>
              <p className="text-text-muted leading-relaxed">
                Get intelligent keyword suggestions and content recommendations tailored to your industry and role.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Process Section */}
      <div className="bg-primary py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Get Started Building Your CV
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Follow these simple steps to create your professional CV in minutes
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-accent to-accent-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-glow">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Sign Up</h3>
                <p className="text-text-muted text-sm">
                  Create your account using email or social media in seconds
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-accent to-accent-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-glow">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Choose Template</h3>
                <p className="text-text-muted text-sm">
                  Select from professional, ATS-optimized templates that suit your industry
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-accent to-accent-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-glow">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Add Your Details</h3>
                <p className="text-text-muted text-sm">
                  Fill in your experience, education, and skills with smart suggestions
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-accent to-accent-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-glow">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Download & Apply</h3>
                <p className="text-text-muted text-sm">
                  Export in multiple formats and start applying to your dream jobs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-accent to-accent-dark py-12 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-white/80">CVs Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-white/80">ATS Pass Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-white/80">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-secondary py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-card rounded-2xl p-8">
              <div className="text-6xl text-accent mb-4">"</div>
              <blockquote className="text-xl text-text-secondary mb-6 italic leading-relaxed">
                I love this CV builder. It's easy to use and is the best I have ever seen so far.
                I got my dream job after using it to build my CV and the ATS optimization really works!
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-r from-accent to-accent-dark rounded-full flex items-center justify-center mr-4 shadow-lg shadow-glow">
                  <span className="text-white font-bold">SJ</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-text-primary">Sarah Johnson</div>
                  <div className="text-text-muted text-sm">Software Engineer at Google</div>
                </div>
              </div>
            </div>

            {/* Additional stats */}
            <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
              <div className="glass-card rounded-lg p-6">
                <div className="text-2xl font-bold text-accent mb-2">582,000+</div>
                <div className="text-text-muted">CVs Created Successfully</div>
              </div>
              <div className="glass-card rounded-lg p-6">
                <div className="text-2xl font-bold text-accent mb-2">3x</div>
                <div className="text-text-muted">More Interview Calls</div>
              </div>
              <div className="glass-card rounded-lg p-6">
                <div className="text-2xl font-bold text-accent mb-2">98%</div>
                <div className="text-text-muted">User Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-primary py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                What are the benefits of using our CV Builder
              </h2>
              <p className="text-lg text-text-muted">
                Beyond helping you craft a great looking CV, our platform gives you the competitive edge you need
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 glass-card rounded-lg flex items-center justify-center border border-accent">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    It is Free
                  </h4>
                  <p className="text-text-muted">
                    Build your CV completely free with our professional CV Builder. No hidden fees or premium restrictions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 glass-card rounded-lg flex items-center justify-center border border-accent">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    Flexible File Formats
                  </h4>
                  <p className="text-text-muted">
                    Build once and download your CV in multiple formats - PDF, Word, LinkedIn format, and ATS-friendly text.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 glass-card rounded-lg flex items-center justify-center border border-accent">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    Priority Job Matching
                  </h4>
                  <p className="text-text-muted">
                    Get priority access to job opportunities that match your profile and be first to know about new openings.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 glass-card rounded-lg flex items-center justify-center border border-accent">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    Smart ATS Optimization
                  </h4>
                  <p className="text-text-muted">
                    Real-time ATS compatibility checking and keyword optimization to ensure your CV passes automated screening.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 glass-card rounded-lg flex items-center justify-center border border-accent">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    Industry Templates
                  </h4>
                  <p className="text-text-muted">
                    Choose from professionally designed templates optimized for different industries and career levels.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 glass-card rounded-lg flex items-center justify-center border border-accent">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    AI-Powered Suggestions
                  </h4>
                  <p className="text-text-muted">
                    Get intelligent content suggestions, skill recommendations, and keyword optimization tailored to your field.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Call to Action */}
      <div className="bg-gradient-to-r from-accent to-accent-dark py-16 shadow-xl">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Try Our CV Builder Now!
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join 582,000+ professionals who have successfully created their CVs and landed their dream jobs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className="bg-white text-accent px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create A Winning CV →
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-accent transition-all duration-300"
            >
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary-dark text-white py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-4">
            <FileText className="w-6 h-6 text-accent mr-2" />
            <span className="text-lg font-semibold">CV Builder</span>
          </div>
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} CV Builder. All rights reserved.
            <span className="mx-2">•</span>
            Built with ❤️ for job seekers everywhere
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
