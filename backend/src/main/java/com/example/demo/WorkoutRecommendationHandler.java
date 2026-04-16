package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
// import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}) // React dev server
public class WorkoutRecommendationHandler {

    @Autowired
    private ImageRecognitionService imageRecognitionService;

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
        //this is ethan's job to generate the workout
        WorkoutSchedule workoutSchedule = generateWorkout(userInput);

        //TODO:
        //will return a WorkoutSchedule object and jackson will automatically convert it to json
        //then front end will need to figure out how to display it
        return "Workout config received for goal: " + userInput.getUserGoal();
    }

    // get an equipment list (technically java set)
    // Set<String> equipment = some method in ImageRecognitionService
    //setAvailableEquipment(equipment);
    @PostMapping("/detect")
    public Set<String> getEquipment(@RequestParam("files") MultipartFile[] files) {
        Set<String> allDetectedEquipment = new HashSet<>();
        System.out.println("Received " + files.length + " files.");

        try {
            for (MultipartFile file : files) {
                List<String> labels = this.imageRecognitionService.getLabels(file);
                allDetectedEquipment.addAll(labels); 
            }
            return allDetectedEquipment;
        } catch (Exception e) {
            System.err.println("VISION API FAILED: " + e.getMessage());
            e.printStackTrace();
            return null; 
        }
    }

    public WorkoutSchedule generateWorkout(UserInputData userdata){
        //TODO

        return null;
    }
}
