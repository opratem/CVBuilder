import type React from 'react';
import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { FileText, Shield, Zap, Users, CheckCircle, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { continueAsGuest } = useAuth();

  return (
    <div className="min-h-screen bg-[#13141C]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1B26] to-[#13141C] opacity-50"></div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-gradient-to-r from-[#4EAA93] to-[#3D8977] p-3 rounded-2xl mr-4 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                CV Builder
              </h1>
            </div>
            <p className="text-2xl font-semibold text-gray-200 mb-2 max-w-2xl mx-auto">
              Create your profile in 5 minutes and be discovered
            </p>
            <p className="text-lg text-gray-400 mb-6 max-w-2xl mx-auto">
              Download Your CV Instantly and Use It Anywhere
            </p>
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-[#4EAA93]" />
                <span>10,000+ users</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1 text-[#4EAA93]" />
                <span>ATS-friendly</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1 text-[#4EAA93]" />
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
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#13141C] text-gray-400">or</span>
                </div>
              </div>

              <button
                onClick={continueAsGuest}
                className="mt-4 w-full flex items-center justify-center px-6 py-3 border border-gray-600 rounded-lg text-gray-300 bg-[#1A1B26] hover:bg-[#22232F] transition-all duration-200 group"
              >
                <span>Continue as Guest</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="mt-3 text-center text-xs text-gray-500">
                Try the app without signing up. Your data will be stored locally.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#1A1B26] py-16 border-t border-[#353B42]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose Our CV Builder?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Join thousands of professionals who landed their dream jobs with our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-[#252A30] border border-[#353B42] hover:border-[#4EAA93] transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#4EAA93] to-[#3D8977] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Professional Templates
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Choose from beautifully designed, industry-specific templates that pass ATS screening and impress hiring managers.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-[#252A30] border border-[#353B42] hover:border-[#4EAA93] transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#4EAA93] to-[#3D8977] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                ATS Optimization
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Real-time ATS compatibility checking ensures your CV gets through automated screening systems.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-[#252A30] border border-[#353B42] hover:border-[#4EAA93] transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#4EAA93] to-[#3D8977] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Smart Suggestions
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Get intelligent keyword suggestions and content recommendations tailored to your industry and role.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Process Section */}
      <div className="bg-[#13141C] py-16 border-t border-[#353B42]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Get Started Building Your CV
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Follow these simple steps to create your professional CV in minutes
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#4EAA93] to-[#3D8977] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Sign Up</h3>
                <p className="text-gray-400 text-sm">
                  Create your account using email or social media in seconds
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#4EAA93] to-[#3D8977] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Choose Template</h3>
                <p className="text-gray-400 text-sm">
                  Select from professional, ATS-optimized templates that suit your industry
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#4EAA93] to-[#3D8977] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Add Your Details</h3>
                <p className="text-gray-400 text-sm">
                  Fill in your experience, education, and skills with smart suggestions
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#4EAA93] to-[#3D8977] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Download & Apply</h3>
                <p className="text-gray-400 text-sm">
                  Export in multiple formats and start applying to your dream jobs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-[#4EAA93] to-[#3D8977] py-12 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-gray-100">CVs Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-gray-100">ATS Pass Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-gray-100">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-[#1A1B26] py-16 border-t border-[#353B42]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-[#252A30] rounded-2xl p-8 border border-[#353B42]">
              <div className="text-6xl text-[#4EAA93] mb-4">"</div>
              <blockquote className="text-xl text-gray-300 mb-6 italic leading-relaxed">
                I love this CV builder. It's easy to use and is the best I have ever seen so far.
                I got my dream job after using it to build my CV and the ATS optimization really works!
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#4EAA93] to-[#3D8977] rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-bold">SJ</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Sarah Johnson</div>
                  <div className="text-gray-400 text-sm">Software Engineer at Google</div>
                </div>
              </div>
            </div>

            {/* Additional stats */}
            <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-[#252A30] rounded-lg p-6 border border-[#353B42]">
                <div className="text-2xl font-bold text-[#4EAA93] mb-2">582,000+</div>
                <div className="text-gray-400">CVs Created Successfully</div>
              </div>
              <div className="bg-[#252A30] rounded-lg p-6 border border-[#353B42]">
                <div className="text-2xl font-bold text-[#4EAA93] mb-2">3x</div>
                <div className="text-gray-400">More Interview Calls</div>
              </div>
              <div className="bg-[#252A30] rounded-lg p-6 border border-[#353B42]">
                <div className="text-2xl font-bold text-[#4EAA93] mb-2">98%</div>
                <div className="text-gray-400">User Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-[#13141C] py-16 border-t border-[#353B42]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                What are the benefits of using our CV Builder
              </h2>
              <p className="text-lg text-gray-400">
                Beyond helping you craft a great looking CV, our platform gives you the competitive edge you need
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#252A30] rounded-lg flex items-center justify-center border border-[#4EAA93]">
                  <FileText className="w-6 h-6 text-[#4EAA93]" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    It is Free
                  </h4>
                  <p className="text-gray-400">
                    Build your CV completely free with our professional CV Builder. No hidden fees or premium restrictions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#252A30] rounded-lg flex items-center justify-center border border-[#4EAA93]">
                  <Shield className="w-6 h-6 text-[#4EAA93]" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Flexible File Formats
                  </h4>
                  <p className="text-gray-400">
                    Build once and download your CV in multiple formats - PDF, Word, LinkedIn format, and ATS-friendly text.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#252A30] rounded-lg flex items-center justify-center border border-[#4EAA93]">
                  <TrendingUp className="w-6 h-6 text-[#4EAA93]" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Priority Job Matching
                  </h4>
                  <p className="text-gray-400">
                    Get priority access to job opportunities that match your profile and be first to know about new openings.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#252A30] rounded-lg flex items-center justify-center border border-[#4EAA93]">
                  <Zap className="w-6 h-6 text-[#4EAA93]" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Smart ATS Optimization
                  </h4>
                  <p className="text-gray-400">
                    Real-time ATS compatibility checking and keyword optimization to ensure your CV passes automated screening.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#252A30] rounded-lg flex items-center justify-center border border-[#4EAA93]">
                  <Users className="w-6 h-6 text-[#4EAA93]" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Industry Templates
                  </h4>
                  <p className="text-gray-400">
                    Choose from professionally designed templates optimized for different industries and career levels.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#252A30] rounded-lg flex items-center justify-center border border-[#4EAA93]">
                  <Sparkles className="w-6 h-6 text-[#4EAA93]" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    AI-Powered Suggestions
                  </h4>
                  <p className="text-gray-400">
                    Get intelligent content suggestions, skill recommendations, and keyword optimization tailored to your field.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Call to Action */}
      <div className="bg-gradient-to-r from-[#4EAA93] to-[#3D8977] py-16 shadow-xl">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Try Our CV Builder Now!
          </h2>
          <p className="text-gray-100 text-lg mb-8 max-w-2xl mx-auto">
            Join 582,000+ professionals who have successfully created their CVs and landed their dream jobs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className="bg-white text-[#4EAA93] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create A Winning CV →
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#4EAA93] transition-all duration-300"
            >
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0D0E14] text-white py-8 border-t border-[#353B42]">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-4">
            <FileText className="w-6 h-6 text-[#4EAA93] mr-2" />
            <span className="text-lg font-semibold">CV Builder</span>
          </div>
          <p className="text-gray-400 text-sm">
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
