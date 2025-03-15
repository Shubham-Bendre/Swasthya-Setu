import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Heart, Clock } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } });
  }, [controls]);

  const features = [
    {
      icon: <Shield size={60} className="text-blue-500 drop-shadow-lg" />,
      title: "Sentinel Shield",
      description: "Advanced analytics for proactive health monitoring and regional insights.",
    },
    {
      icon: <Heart size={60} className="text-red-500 drop-shadow-lg" />,
      title: "Empathy Engine",
      description: "Real-time data-driven care, delivering compassionate service to patients.",
    },
    {
      icon: <Clock size={60} className="text-green-500 drop-shadow-lg" />,
      title: "Velocity Response",
      description: "Instant alerts and notifications for lightning-fast organizational responses.",
    },
  ];

  const featureVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className="min-h-screen bg-gradient-to-br from-indigo-900 to-blue-800 text-white py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-8 leading-tight drop-shadow-lg">
            Svastya Setu : Illuminate Health.
          </h1>
          <p className="text-xl sm:text-2xl mb-12 leading-relaxed drop-shadow-md">
            Revolutionizing health monitoring with real-time insights and unparalleled responsiveness.
          </p>
          <p className="text-md text-gray-300 mb-16 drop-shadow-sm">
            Join forces with doctors, NGOs, and governments to proactively manage and mitigate disease outbreaks.
          </p>

          {/* Call-to-Actions */}
          <div className="flex justify-center gap-6">
            <Button
              onClick={() => navigate("/dashboard")}
              className="px-10 py-5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 text-lg flex items-center gap-3 group"
            >
              Ignite Access
              <ArrowRight size={24} className="transition-transform group-hover:translate-x-2" />
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              className="px-10 py-5 bg-transparent border border-gray-400 text-gray-300 font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-lg"
            >
              Enter Portal
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={featureVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.2 }}
              className="p-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl hover:shadow-xl transition-all duration-300 flex flex-col items-center"
            >
              <div className="mb-8">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-300 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}