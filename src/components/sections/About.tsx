import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Shield } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <motion.div 
      id="about"
      className="mb-24 scroll-mt-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Our Platform</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We believe in the power of community-driven funding to transform ideas into reality and create positive impact across Kenya.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="bg-white/50 backdrop-blur-sm border-green-100 hover:border-green-200 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              Community First
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Our platform brings together passionate creators and supportive backers to build stronger communities.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-green-100 hover:border-green-200 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-green-600" />
              Impact Driven
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Every campaign on our platform is designed to create meaningful change and positive impact in communities.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-green-100 hover:border-green-200 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600" />
              Trusted & Secure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              With verified campaigns and secure payment processing, we ensure your contributions reach the right causes.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default About;
