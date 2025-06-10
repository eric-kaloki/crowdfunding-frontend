import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  
  return (
    <div className="sticky top-0 z-50 flex flex-row items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b w-full">
      <img
        src="/transcends.png"
        alt="Transcends Logo"
        className="hidden md:block h-10 w-auto"
      />
      <img
        src="/transcends-icon.png"
        alt="Transcends Logo"
        className="md:hidden h-10 w-auto"
      />
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className=" md:flex text-gray-600 hover:text-gray-900"
          onClick={() => {
            const element = document.getElementById('about');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          About
        </Button>
        <Button 
          variant="ghost"
          className=" md:flex text-gray-600 hover:text-gray-900"
          onClick={() => {
            const element = document.getElementById('services');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Services
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate("/login")}
          className="hidden md:flex items-center gap-2"
        >
          <LogIn size={16} />
          Sign In
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => navigate("/login")}
          className="flex md:hidden items-center gap-2"
        >
          <LogIn size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Header;