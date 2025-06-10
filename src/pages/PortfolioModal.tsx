import { Link,useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Heart } from "lucide-react";
import Header from "@/components/Header";

interface Campaign {
  id: number;
  title: string;
  description: string;
  image: string;
  raised: string;
  goal: string;
  backers: number;
  category: string;
}

const campaigns: Campaign[] = [
  {
    id: 1,
    title: "Clean Water for Kibera Schools",
    description: "Providing clean water access to 5 schools in Kibera slums, impacting over 2,000 students with safe drinking water and improved sanitation facilities.",
    image: "/campaigns/water-project.jpg",
    raised: "KES 850,000",
    goal: "KES 1,000,000",
    backers: 234,
    category: "Education"
  },
  {
    id: 2,
    title: "Solar Power for Rural Clinics",
    description: "Installing solar power systems in 3 rural health clinics to ensure 24/7 medical services and refrigeration for vaccines.",
    image: "/campaigns/solar-clinic.jpg",
    raised: "KES 450,000",
    goal: "KES 500,000",
    backers: 156,
    category: "Healthcare"
  },
  {
    id: 3,
    title: "Youth Tech Training Center",
    description: "Establishing a community tech training center to provide digital skills to 200+ youth in Nakuru, creating employment opportunities.",
    image: "/campaigns/tech-training.jpg",
    raised: "KES 320,000",
    goal: "KES 400,000",
    backers: 89,
    category: "Technology"
  },
  {
    id: 4,
    title: "Women's Cooperative Farm",
    description: "Supporting 50 women farmers with modern farming equipment and seeds to increase crop yields and improve family incomes.",
    image: "/campaigns/women-farm.jpg",
    raised: "KES 280,000",
    goal: "KES 350,000",
    backers: 167,
    category: "Agriculture"
  }
];

const PortfolioPage = () => {
  const navigate = useNavigate();
  
  const calculateProgress = (raised: string, goal: string) => {
    const raisedAmount = parseInt(raised.replace(/[^\d]/g, ''));
    const goalAmount = parseInt(goal.replace(/[^\d]/g, ''));
    return Math.min((raisedAmount / goalAmount) * 100, 100);
  };

  return (
    <>
    <Header />
    <div className="container mx-auto px-6 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          See how our platform has helped create positive impact across Kenya through community-driven funding
        </p>
      </header>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mt-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/campaigns/placeholder.jpg';
                }}
              />
              <div className="absolute top-4 left-4">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {campaign.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{campaign.title}</h3> 
              <p className="text-gray-600 mb-4 line-clamp-3">{campaign.description}</p>
              
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="font-medium">{campaign.raised} raised</span>
                  <span>{campaign.goal} goal</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all" 
                    style={{ width: `${calculateProgress(campaign.raised, campaign.goal)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    {calculateProgress(campaign.raised, campaign.goal).toFixed(0)}% funded
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Heart size={14} className="text-green-600" />
                    {campaign.backers} backers
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700"
                variant="default"
                onClick={() => navigate("/signup")}
              >
                <Target className="mr-2 h-4 w-4" />
                Support Similar Causes
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate("/signup")}
          className="border-green-200 hover:border-green-300 text-green-700 hover:bg-green-50"
        >
          Join Our Community
        </Button>
      </div>
    </div>
    </>
  );
};

export default PortfolioPage;
