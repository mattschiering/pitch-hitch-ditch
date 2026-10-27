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
  { name: "Robert, Corporate Manager", age: 50, income: "$160,000 / year", location: "New York, New York", traits: "Status-aware, time-poor, expects premium service" },
  { name: "Olivia, New Mom", age: 30, income: "$62,000 / year", location: "Nashville, Tennessee", traits: "Sleep-deprived, researches everything, trusts other parents" },
  { name: "Marcus, Army Veteran Student", age: 29, income: "$42,000 / year (GI Bill + job)", location: "San Antonio, Texas", traits: "Disciplined, values durability, wants straightforward honesty" },
  { name: "Sofia, High School Teacher", age: 38, income: "$58,000 / year", location: "Phoenix, Arizona", traits: "Stretches every dollar, buys for the classroom and her family" },
  { name: "Ethan, Gamer & Streamer", age: 20, income: "$18,000 / year", location: "Seattle, Washington", traits: "Lives online, loves new tech, loyal to communities" },
  { name: "Grace, Retired Librarian", age: 67, income: "$52,000 / year", location: "Burlington, Vermont", traits: "Careful reader, skeptical of ads, values quality" },
  { name: "Dev, Software Engineer", age: 29, income: "$130,000 / year", location: "San Jose, California", traits: "Analytical, compares specs, dislikes fluff" },
  { name: "Hannah, Fitness Instructor", age: 31, income: "$45,000 / year", location: "Miami, Florida", traits: "Health-obsessed, active on social, wants to inspire clients" },
  { name: "Luis, Restaurant Owner", age: 44, income: "$90,000 / year", location: "Albuquerque, New Mexico", traits: "Long hours, watches margins, loyal to good suppliers" },
  { name: "Chloe, Middle Schooler", age: 13, income: "$400 / year (allowance)", location: "Columbus, Ohio", traits: "Peer-driven, parents control the wallet, loves trends" },
  { name: "George, Long-Haul Trucker", age: 55, income: "$72,000 / year", location: "Memphis, Tennessee", traits: "Always on the road, practical, brand loyal" },
  { name: "Amara, Pre-Med Student", age: 21, income: "$15,000 / year", location: "Philadelphia, Pennsylvania", traits: "Time-starved, caffeine-powered, stress-prone" },
  { name: "Kenji, Urban Minimalist", age: 34, income: "$88,000 / year", location: "San Francisco, California", traits: "Owns little, buys quality, eco-conscious" },
  { name: "Rosa, Grandmother", age: 72, income: "$36,000 / year", location: "El Paso, Texas", traits: "Family-centered, shops in person, trusts word of mouth" },
  { name: "Tyler, Construction Foreman", age: 39, income: "$76,000 / year", location: "Pittsburgh, Pennsylvania", traits: "Hands-on, hard on his gear, no-nonsense" },
  { name: "Nina, Freelance Designer", age: 28, income: "$52,000 / year (irregular)", location: "Brooklyn, New York", traits: "Aesthetics-first, loves indie brands, watches cash flow" },
  { name: "Omar, Pharmacist", age: 42, income: "$125,000 / year", location: "Dearborn, Michigan", traits: "Detail-oriented, safety-minded, family man" },
  { name: "Brooke, Sorority President", age: 20, income: "$10,000 / year (family support)", location: "Athens, Georgia", traits: "Trendsetter, buys as a group, brand-aware" },
  { name: "Frank, Weekend Golfer", age: 62, income: "$140,000 / year", location: "Scottsdale, Arizona", traits: "Loves premium gear, values status and leisure" },
  { name: "Keisha, Marketing Manager", age: 36, income: "$98,000 / year", location: "Charlotte, North Carolina", traits: "Time-poor working parent, brand-savvy, loves convenience" },
  { name: "Sam, Remote Worker", age: 33, income: "$85,000 / year", location: "Boise, Idaho", traits: "Works from home, values comfort, always upgrading the setup" },
  { name: "Isabel, Environmental Activist", age: 24, income: "$28,000 / year", location: "Eugene, Oregon", traits: "Values-driven, boycotts brands, shares widely" },
  { name: "Pete, Hobbyist Woodworker", age: 52, income: "$68,000 / year", location: "Madison, Wisconsin", traits: "Loves craft, researches tools deeply, active in forums" },
  { name: "Fatima, ER Doctor", age: 40, income: "$260,000 / year", location: "Houston, Texas", traits: "Rare free time, pays for convenience, high standards" },
  { name: "Noah, College Athlete", age: 20, income: "$8,000 / year", location: "Tuscaloosa, Alabama", traits: "Training-focused, influenced by sponsors and teammates" },
  { name: "Beth, Volunteer Coordinator", age: 49, income: "$54,000 / year", location: "Greenville, South Carolina", traits: "Community-minded, budget-minded, organizes group purchases" },
  { name: "Andre, Music Producer", age: 26, income: "$40,000 / year", location: "Atlanta, Georgia", traits: "Creative, early adopter of audio gear, tight influencer circle" },
  { name: "Lucy, Solo Traveler", age: 27, income: "$48,000 / year", location: "Salt Lake City, Utah", traits: "Adventure-seeking, packs light, books everything online" },
  { name: "Harold, Family Farmer", age: 60, income: "$64,000 / year", location: "Rural Nebraska", traits: "Values reliability, distrusts hype, buys at the co-op" }
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
  { name: "Portable Espresso Maker", description: "Hand-powered espresso anywhere, no electricity needed.", price: "$60" },
  { name: "Smart Baby Monitor", description: "Video monitor with sleep tracking and phone alerts.", price: "$149" },
  { name: "Rechargeable Hand Warmers", description: "Pocket-sized warmers that last 8 hours per charge.", price: "$29" },
  { name: "Pantry Recipe App", description: "Builds recipes and grocery lists from what you already have.", price: "$8 / month" },
  { name: "Wireless Gaming Mouse", description: "Lightweight mouse with programmable buttons.", price: "$79" },
  { name: "Weighted Blanket", description: "15-pound blanket designed to help you sleep.", price: "$95" },
  { name: "Pet GPS Collar", description: "Tracks your pet's location and activity in real time.", price: "$59 + $6 / month" },
  { name: "Reusable Grocery Totes", description: "Set of five foldable totes made from recycled bottles.", price: "$18" },
  { name: "Blue-Light Glasses", description: "Lenses that reduce eye strain from screens.", price: "$45" },
  { name: "Razor Subscription", description: "Quality razor with monthly blade refills delivered.", price: "$12 / month" },
  { name: "Smart Thermostat", description: "Learns your schedule and cuts your energy bill.", price: "$199" },
  { name: "AI Flashcard App", description: "Turns your notes into study flashcards automatically.", price: "$6 / month" },
  { name: "Cold Brew Coffee Maker", description: "Makes a week of cold brew in one batch.", price: "$40" },
  { name: "Resistance Band Set", description: "Five bands and a door anchor for home workouts.", price: "$25" },
  { name: "Pocket Power Bank", description: "10,000 mAh charger that fits in your pocket.", price: "$30" },
  { name: "Online Tutoring Service", description: "Live one-on-one tutoring matched to your course.", price: "$40 / hour" },
  { name: "Insulated Steel Lunchbox", description: "Leak-proof lunch container that keeps food hot or cold.", price: "$38" },
  { name: "Foldable 4K Drone", description: "Compact camera drone with 4K video.", price: "$349" },
  { name: "Plant-Based Skincare Set", description: "Cleanser, serum and moisturizer with natural ingredients.", price: "$64" },
  { name: "Video Doorbell", description: "Doorbell camera with package and visitor alerts.", price: "$99" },
  { name: "Ergonomic Office Chair", description: "Adjustable lumbar support and breathable mesh back.", price: "$320" },
  { name: "Compostable Phone Case", description: "Plant-based case that breaks down at end of life.", price: "$35" },
  { name: "Cordless Power Drill", description: "20-volt drill with two batteries and a carry case.", price: "$129" },
  { name: "Workplace Lunch Delivery", description: "Chef-made lunches delivered to your office or site.", price: "$11 each" },
  { name: "Muscle Recovery Boots", description: "Compression boots that speed up recovery after training.", price: "$250" },
  { name: "Group Order Platform", description: "Collect orders and payments for group purchases in one link.", price: "Free + 3% fee" },
  { name: "Studio Headphones", description: "Wired headphones with a flat, accurate sound profile.", price: "$159" },
  { name: "Carry-On Travel Backpack", description: "Airline-sized pack with hidden pockets and a USB port.", price: "$110" },
  { name: "Solar Livestock Water Pump", description: "Waters animals in the field with no electricity needed.", price: "$780" }
];

// Seconds students get to prepare their pitch
const PREP_SECONDS = 90;
