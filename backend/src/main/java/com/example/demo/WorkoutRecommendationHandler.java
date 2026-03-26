package com.example.demo;

// import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // React dev server
public class WorkoutRecommendationHandler {

    // POST /api/workout — receives JSON body and maps it to UserInputData
    @PostMapping("/workout")
    public String receiveWorkoutConfig(@RequestBody UserInputData userInput) {
        System.out.println("Received workout config:");
        System.out.println("  Goal:       " + userInput.getUserGoal());
        System.out.println("  Level:      " + userInput.getUserLevel());
        System.out.println("  Days:       " + userInput.getNumDays());
        System.out.println("  Muscles:    " + java.util.Arrays.toString(userInput.getTargetMuscles()));
        System.out.println("  Equipment:  " + userInput.getAvailableEquipment());

        //TODO
        //this is danny's job to get an equipment list (technically java set)
        // Set<String> equipment = some method in ImageRecognitionService
        //setAvailableEquipment(equipment);

        //TODO
        //this is ethan's job to generate the workout
        WorkoutSchedule workoutSchedule = generateWorkout(userInput);

        //TODO:
        //will return a WorkoutSchedule object and jackson will automatically convert it to json
        //then front end will need to figure out how to display it
        return "Workout config received for goal: " + userInput.getUserGoal();
    }

    public WorkoutSchedule generateWorkout(UserInputData userdata){
        //TODO

        return null;
    }
}
