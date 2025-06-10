
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Features from "@/components/sections/Features";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <motion.div 
        className="container mx-auto px-4 py-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Hero />
        <Stats />
        <Features />
        <About />
        <Services />
      </motion.div>
      <Footer />
      <Outlet />
    </div>
  );
};

export default Index;
