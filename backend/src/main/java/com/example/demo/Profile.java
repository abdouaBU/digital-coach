package com.example.demo;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    private Integer age;
    private Integer height; // cm
    private Double currentweight; // kg
    private Double targetweight; // kg
    private Double bodyfat; // percentage
    private String level; // Beginner, Intermediate, Advanced
    private String goaltype; // cutting, bulking, maintain
    private Integer workoutdaysperweek;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Default constructor
    public Profile() {}

    // Getters and setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Double getCurrentweight() {
        return currentweight;
    }

    public void setCurrentweight(Double currentweight) {
        this.currentweight = currentweight;
    }

    public Double getTargetweight() {
        return targetweight;
    }

    public void setTargetweight(Double targetweight) {
        this.targetweight = targetweight;
    }

    public Double getBodyfat() {
        return bodyfat;
    }

    public void setBodyfat(Double bodyfat) {
        this.bodyfat = bodyfat;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getGoaltype() {
        return goaltype;
    }

    public void setGoaltype(String goaltype) {
        this.goaltype = goaltype;
    }

    public Integer getWorkoutdaysperweek() {
        return workoutdaysperweek;
    }

    public void setWorkoutdaysperweek(Integer workoutdaysperweek) {
        this.workoutdaysperweek = workoutdaysperweek;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
