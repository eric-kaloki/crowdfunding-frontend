import { Mail, Heart, Target, Users } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src="/transcends.png" alt="Transcends Logo" className="h-8 w-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Empowering communities through crowdfunding and connecting dreamers with supporters across Kenya.
            </p>
            <div className="flex items-center gap-2 text-green-600">
              <Heart size={16} />
              <span className="text-sm">Made with love in Kenya</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">For Creators</h3>
            <ul className="space-y-2">
              <li><a href="/signup" className="text-gray-600 hover:text-green-600 flex items-center gap-2">
                <Target size={14} />
                Start a Campaign
              </a></li>
              <li><a href="#services" className="text-gray-600 hover:text-green-600">Campaign Guidelines</a></li>
              <li><a href="#services" className="text-gray-600 hover:text-green-600">Success Stories</a></li>
              <li><a href="#services" className="text-gray-600 hover:text-green-600">Creator Resources</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">For Backers</h3>
            <ul className="space-y-2">
              <li><a href="/signup" className="text-gray-600 hover:text-green-600 flex items-center gap-2">
                <Users size={14} />
                Browse Campaigns
              </a></li>
              <li><a href="#about" className="text-gray-600 hover:text-green-600">How It Works</a></li>
              <li><a href="#about" className="text-gray-600 hover:text-green-600">Community Impact</a></li>
              <li><a href="#about" className="text-gray-600 hover:text-green-600">Trust & Safety</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                transcends.corp@gmail.com
              </li>
              <li><a href="#" className="text-gray-600 hover:text-green-600">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-green-600">Contact Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-green-600">Terms & Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-center md:text-left">
              &copy; {new Date().getFullYear()} Transcends Corp. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="text-sm text-gray-500">Trusted by 500+ backers</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500">KES 2M+ raised</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;