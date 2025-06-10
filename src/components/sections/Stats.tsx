import { motion } from "framer-motion";

const Stats = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
      <motion.div className="text-center" {...fadeIn}>
        <h3 className="text-4xl font-bold text-green-600 mb-2">50+</h3>
        <p className="text-gray-600">Campaigns Funded</p>
      </motion.div>
      <motion.div className="text-center" {...fadeIn}>
        <h3 className="text-4xl font-bold text-green-600 mb-2">KES 2M+</h3>
        <p className="text-gray-600">Funds Raised</p>
      </motion.div>
      <motion.div className="text-center" {...fadeIn}>
        <h3 className="text-4xl font-bold text-green-600 mb-2">500+</h3>
        <p className="text-gray-600">Happy Backers</p>
      </motion.div>
      <motion.div className="text-center" {...fadeIn}>
        <h3 className="text-4xl font-bold text-green-600 mb-2">95%</h3>
        <p className="text-gray-600">Success Rate</p>
      </motion.div>
    </div>
  );
};

export default Stats;
