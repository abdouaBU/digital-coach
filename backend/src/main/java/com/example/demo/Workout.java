package com.example.demo;

import java.util.*;

public class Workout {
    private Day day;
    private List<Exercise> exerciseList;

    public enum Day{
        MO,
        TU,
        WE,
        TH,
        FR,
        SA,
        SU;
    }
    
    public Workout(){
        //TODO
    }

    //getters

    public Day getDay(){
        return this.day;
    }

    public List<Exercise> getExerciseList(){
        return this.exerciseList;
    }
}