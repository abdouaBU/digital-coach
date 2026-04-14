package com.example.demo;

import com.google.cloud.spring.vision.CloudVisionTemplate;
import com.google.cloud.vision.v1.AnnotateImageResponse;
import com.google.cloud.vision.v1.Feature.Type;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service // This tells Spring to manage this class
public class ImageRecognitionService {

    @Autowired
    private CloudVisionTemplate cloudVisionTemplate;

    /**
     * Identifies objects/labels from an uploaded file
     */
    public List<String> getLabels(MultipartFile file) {
        
        AnnotateImageResponse response = this.cloudVisionTemplate.analyzeImage(
                file.getResource(), 
                Type.LABEL_DETECTION);

        return response.getLabelAnnotationsList().stream()
                .map(label -> label.getDescription())
                .collect(Collectors.toList());
    }
}