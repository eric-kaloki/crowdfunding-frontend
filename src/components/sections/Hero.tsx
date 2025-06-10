import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="text-center mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4 inline-block">
        Kenya's Leading Crowdfunding Platform
      </span>
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
        Fund Dreams,
        <br />
        Change Communities
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        At Transcends Corp, we connect passionate creators with supportive backers to bring life-changing projects to reality.
        Whether you're launching a community initiative, innovative product, or social cause, we provide the platform to
        raise funds, build communities, and make a lasting impact across Kenya and beyond.
      </p>

      <div className="flex gap-4 justify-center flex-wrap">
        <Button
          size="lg"
          className="transition-all bg-green-600 hover:bg-green-700"
          variant="default"
          onClick={() => navigate("/signup")}
        >
          <Target className="mr-2 h-5 w-5" />
          Start a Campaign
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate("/signup")}
          className="border-green-200 hover:border-green-300 text-green-700 hover:bg-green-50"
        >
          <Heart className="mr-2 h-5 w-5" />
          Support a Cause
        </Button>
      </div>

      {/* Trust indicators */}
      <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Secure Payments
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Verified Campaigns
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Community-Driven
        </div>
      </div>
    </motion.div>
  );
};

export default Hero;
