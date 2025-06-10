import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

const Features = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <motion.div 
      className="mb-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Platform Features</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Everything you need to launch and manage successful crowdfunding campaigns
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <motion.div {...fadeInUp}>
          <Card className="bg-white/50 backdrop-blur-sm border-green-100 hover:border-green-200 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-green-600" />
                Campaign Creation
              </CardTitle>
              <CardDescription>
                Launch your campaign with powerful tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create compelling campaigns with rich storytelling, reward tiers, 
                and goal tracking to engage your supporters effectively.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <Card className="bg-white/50 backdrop-blur-sm border-green-100 hover:border-green-200 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                Secure Payments
              </CardTitle>
              <CardDescription>
                Safe and trusted payment processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Integrated M-Pesa payments with fraud protection and secure 
                fund management for both creators and backers.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <Card className="bg-white/50 backdrop-blur-sm border-green-100 hover:border-green-200 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                Community Building
              </CardTitle>
              <CardDescription>
                Connect with supporters and backers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Build lasting relationships with your community through updates, 
                comments, and direct communication tools.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Features;
