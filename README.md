# digital-coach
Web app/fitness platform which assists in tracking nutrition and fitness goals
##HOW TO RUN
In CMD 1: run 'mvnw.cmd clean spring-boot:run' in backend.
In CMD 2: run 'npm run dev' in frontend. Then open the link ex. 'http://localhost:5173/' in a browser.
##EXPLANATION
WorkoutForm.jsx in frontend is sending http request to the backend.
Lines 7-13 
"const [form, setForm] = useState({
    userGoal: "",
    userLevel: "",
    numDays: 3,
    targetMuscles: [],
    availableEquipment: [],//don't include in final version because this comes from
                           //the image recognition API from Danny
  });"
generates an object that is then sent as a json file to the back end in lines 32-36
"const res = await fetch("http://localhost:8080/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });"
All the front end needs to do is complete the first object (however thats done look at the example file to figure it out) then send it with the second code section in the actual final version
(if i am correct and everything is working :)