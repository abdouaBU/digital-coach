# 💪 Digital Coach

> Your personal AI-powered fitness and nutrition companion

## 🌟 Highlights

- 🤖 **Smart Workout Generation** — AI-powered recommendation engine that creates personalized workout plans based on your goals, fitness level, and available equipment
- 📷 **Image Recognition** — Identify available equipment using computer vision to auto-populate your workout options
- 🎯 **Goal Tracking** — Set and monitor your fitness and nutrition goals with an intuitive tracking dashboard
- 📊 **Progress Analytics** — Track your fitness journey with detailed progress metrics and visualizations
- 🍎 **Nutrition Planning** — Receive personalized nutrition recommendations tailored to your fitness goals
- 🔐 **Secure & Private** — User authentication and secure data management for your fitness information

## ℹ️ Overview

Digital Coach is a comprehensive fitness platform that bridges the gap between fitness aspirations and actionable results. Whether you're a beginner just starting your fitness journey or an experienced athlete looking to optimize your training, Digital Coach provides personalized workout and nutrition recommendations powered by AI.

The platform combines a modern web interface with a robust backend API to deliver real-time workout recommendations, progress tracking, and nutritional guidance. Simply tell us your goals, current fitness level, available equipment, and the number of days you want to train — and Digital Coach will generate a customized workout plan just for you.

### 👥 Built For

Whether you're looking to build muscle, lose weight, improve endurance, or just stay active, Digital Coach adapts to your unique needs and constraints.

---

## 🚀 Quick Start

### IDEAL WAY:
- Open the site from our deployed link: https://digital-coach-production-14d1.up.railway.app
- To run from the terminal, follow the below steps

### ⬇️ Installation

**Prerequisites:**
- Java 11+ (for backend)
- Node.js 16+ and npm (for frontend)
- Git

**1. Clone the repository:**
```bash
git clone https://github.com/abdouaBU/digital-coach.git
cd digital-coach
```

**2. Backend setup:**
```bash
cd backend
# On Windows:
mvnw.cmd spring-boot:run
# On macOS/Linux:
./mvnw spring-boot:run
```

**3. Frontend setup (in a new terminal):**
```bash
cd frontend
npm install
npm run dev
```

**4. Open your browser:**
Navigate to `http://localhost:5173/` (it may also be `http://localhost:3000` on your device) and start working out!


---

## 💡 Usage

### How It Works

1. **Create Your Profile** — Sign up and tell Digital Coach about your fitness goals, current fitness level, and available equipment
2. **Get Recommendations** — The AI analyzes your preferences and generates personalized workout plans
3. **Track Progress** — Log your workouts and nutrition to see your progress over time
4. **Adapt & Improve** — Receive updated recommendations based on your progress and feedback

### Under the Hood

The Digital Coach architecture follows a client-server model:

**Frontend (React + Vite)** — Sends your preferences as a JSON request:
```javascript
const workoutRequest = {
  userGoal: "muscle_gain",
  userLevel: "intermediate",
  numDays: 3,
  targetMuscles: ["chest", "back"],
  availableEquipment: ["dumbbells", "barbell"], // detected via image recognition
};

// This is sent to the backend API
const response = await fetch("/api/workout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(workoutRequest),
});
```

**Backend (Spring Boot)** — Processes your request and returns an optimized workout plan:
- `WorkoutRecommendationHandler.java` — Generates personalized recommendations
- `ImageRecognitionService.java` — Identifies available equipment
- `UserRepository.java` — Manages user data and preferences

---

## 📖 Project Structure

```
digital-coach/
├── backend/                 # Spring Boot REST API
│   ├── src/main/java/
│   │   └── com/example/demo/
│   │       ├── DemoApplication.java          # Spring Boot entry point
│   │       ├── AuthController.java           # Authentication endpoints
│   │       ├── WorkoutRecommendationHandler.java  # Core recommendation logic
│   │       ├── ImageRecognitionService.java  # Equipment detection
│   │       └── UserRepository.java           # User data management
│   └── pom.xml              # Maven dependencies
│
├── frontend/                # React + Vite web interface
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── app/             # Next.js pages
│   │   ├── lib/             # Utilities and API clients
│   │   └── main.jsx         # Frontend entry point
│   └── package.json         # npm dependencies
│
└── README.md                # This file
```

---

## 🛠️ Development

### Running Tests

**Backend:**
```bash
cd backend
mvnw.cmd test  # Windows
./mvnw test    # macOS/Linux
```

### Building for Production

**Backend:**
```bash
cd backend
mvnw.cmd clean package  # Windows
./mvnw clean package    # macOS/Linux
```

**Frontend:**
```bash
cd frontend
npm run build
```

---

## 🤝 Contributing

We'd love your help! Here's how you can contribute:

1. **Report Bugs** — Found an issue? Open a GitHub issue with details
2. **Suggest Features** — Have an idea? Start a Discussion to share it
3. **Submit Pull Requests** — Fork the repo, make your changes, and submit a PR
4. **Improve Documentation** — Help us make the README and code comments clearer

---

## 📞 Get Involved

- 💬 **Questions?** Start a Discussion
- 🐛 **Found a Bug?** Open an Issue
- ✨ **Have an Idea?** Create a Feature Request

---

## ✍️ Authors

Digital Coach was created by Abdoul Abdou, Ethan Westerburg, Daniel Thomas, Khai Pham and Hamid Alakbarli. We were undergraduate Computer Science students at Boston University and made this for a group project.

---

Happy training! 🏋️
