// Edit this file to add, remove or change cards. Reload the page to see changes.

const STAGES = [
  {
    name: "Awareness",
    icon: "👀",
    goal: "Get the customer to notice the product and recognize the problem it solves.",
    tips: ["Grab attention fast", "Name the problem or need", "Say where they'll see or hear about it"]
  },
  {
    name: "Consideration",
    icon: "🤔",
    goal: "Help the customer compare options and see why this product fits them.",
    tips: ["Highlight what makes it different", "Address likely questions or doubts", "Offer proof: reviews, demos, trials"]
  },
  {
    name: "Purchase",
    icon: "🛒",
    goal: "Remove the last barriers and motivate the customer to buy now.",
    tips: ["Make buying easy", "Create a reason to act today", "Reassure on price, risk and delivery"]
  },
  {
    name: "Advocacy",
    icon: "📣",
    goal: "Turn a happy customer into a repeat buyer who recommends the product.",
    tips: ["Thank and delight them", "Give a reason to share or refer", "Build loyalty or community"]
  }
];

const PERSONAS = [
  { name: "Maya, College Freshman", age: 18, income: "$12,000 / year", location: "Campus dorm, Ohio", traits: "Budget-conscious, social media native, loves deals" },
  { name: "Dan, Busy Dad", age: 41, income: "$95,000 / year", location: "Suburbs, Texas", traits: "Short on time, values reliability, shops for the family" },
  { name: "Priya, Startup Founder", age: 32, income: "$140,000 / year", location: "Austin, Texas", traits: "Tech-savvy, early adopter, wants efficiency" },
  { name: "Walter, Retiree", age: 70, income: "$48,000 / year", location: "Small town, Florida", traits: "Prefers in-person service, trusts brands he knows" },
  { name: "Carlos, Gig Worker", age: 27, income: "$38,000 / year", location: "Chicago, Illinois", traits: "Always on the move, price-sensitive, mobile-first" },
  { name: "Aisha, Nurse", age: 35, income: "$78,000 / year", location: "Atlanta, Georgia", traits: "Exhausted after shifts, values comfort and quality" },
  { name: "Jake, High School Athlete", age: 16, income: "$3,000 / year (allowance & part-time job)", location: "Denver, Colorado", traits: "Influenced by peers and coaches, loves performance gear" },
  { name: "Linda, Empty Nester", age: 58, income: "$110,000 / year", location: "Portland, Oregon", traits: "New free time, travels, eco-minded" },
  { name: "Mei, Graduate Student", age: 25, income: "$24,000 / year", location: "Boston, Massachusetts", traits: "Research-driven, reads reviews, tight budget" },
  { name: "Tom, Small Business Owner", age: 46, income: "$85,000 / year", location: "Rural Iowa", traits: "Practical, wary of hype, wants clear ROI" },
  { name: "Zoe, Content Creator", age: 22, income: "$30,000 / year", location: "Los Angeles, California", traits: "Trend-focused, loves sharing, brand-collab minded" },
  { name: "Robert, Corporate Manager", age: 50, income: "$160,000 / year", location: "New York, New York", traits: "Status-aware, time-poor, expects premium service" }
];

const PRODUCTS = [
  { name: "Reusable Smart Water Bottle", description: "Tracks hydration and glows to remind you to drink.", price: "$35" },
  { name: "Meal-Prep Subscription Box", description: "Weekly delivery of pre-portioned ingredients and recipes.", price: "$70 / week" },
  { name: "Noise-Cancelling Earbuds", description: "Wireless earbuds with 30-hour battery life.", price: "$129" },
  { name: "Budgeting App", description: "Automatically categorizes spending and sets savings goals.", price: "Free + $5 / month premium" },
  { name: "Ergonomic Standing Desk", description: "Electric height-adjustable desk with memory presets.", price: "$450" },
  { name: "Electric Scooter", description: "Foldable commuter scooter with a 20-mile range.", price: "$599" },
  { name: "Plant-Based Protein Bar", description: "20g of protein, no artificial sweeteners.", price: "$2.50 each" },
  { name: "Online Language Course", description: "Short daily lessons with live conversation practice.", price: "$15 / month" },
  { name: "Home Security Camera", description: "Wi-Fi camera with motion alerts and cloud storage.", price: "$80" },
  { name: "Eco-Friendly Cleaning Kit", description: "Refillable bottles and concentrated cleaning tablets.", price: "$25" },
  { name: "Fitness Tracker Watch", description: "Heart rate, sleep and workout tracking with a week of battery.", price: "$99" },
  { name: "Portable Espresso Maker", description: "Hand-powered espresso anywhere, no electricity needed.", price: "$60" }
];

// Seconds students get to prepare their pitch
const PREP_SECONDS = 90;
