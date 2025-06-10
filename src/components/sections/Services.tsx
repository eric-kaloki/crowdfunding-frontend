import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const Services = () => {
  return (
    <motion.div 
      id="services"
      className="mb-24 scroll-mt-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Simple steps to launch your campaign or support causes you believe in
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="bg-white/50 backdrop-blur-sm border-green-100 hover:border-green-200 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-green-600" />
              Create Campaign
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Launch your project with compelling stories, goals, and rewards for your backers.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-green-100 hover:border-green-200 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              Build Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Connect with supporters who share your vision and want to make a difference.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-green-100 hover:border-green-200 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              Secure Funding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Receive funds securely through our integrated M-Pesa payment system.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-green-100 hover:border-green-200 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Track Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Monitor your campaign's success and keep supporters updated on your progress.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Services;
