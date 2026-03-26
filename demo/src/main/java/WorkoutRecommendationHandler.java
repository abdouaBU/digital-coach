import java.io.*;
import java.util.*;

import java.lang.reflect.Field;
import javax.xml.parsers.*;
import org.w3c.dom.*;


public class WorkoutRecommendationHandler {

    public static UserInputData createFromXml(String xmlFilePath) throws Exception {
        //variables to initailize userdatainput object

        // Parse the XML file
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new File(xmlFilePath));
        doc.getDocumentElement().normalize();

        // Extract fields from XML
        UserInputData.UserGoalEnum userGoal = UserInputData.UserGoalEnum.valueOf(getTagValue(doc, "userGoal"));

        UserInputData.UserLevelEnum userLevel = UserInputData.UserLevelEnum.valueOf(getTagValue(doc, "userLevel"));

        int numDays = Integer.parseInt(getTagValue(doc, "numDays"));

        // Extract targetMuscles list
        NodeList muscleNodes = doc.getElementsByTagName("muscle");
        String[] targetMuscles = new String[muscleNodes.getLength()];
        for (int i = 0; i < muscleNodes.getLength(); i++) {
            targetMuscles[i] = muscleNodes.item(i).getTextContent().trim();
        }

        // Extract availableEquipment list (optional — defaults to empty set if tag is missing)
        NodeList equipmentNodes = doc.getElementsByTagName("equipment");
        Set<String> availableEquipment = new HashSet<>();
        for (int i = 0; i < equipmentNodes.getLength(); i++) {
            availableEquipment.add(equipmentNodes.item(i).getTextContent().trim());
        }

        // Build UserInputData via reflection since constructor is a TODO
        UserInputData userData = new UserInputData();
        setPrivateField(userData, "userGoal", userGoal);
        setPrivateField(userData, "userLevel", userLevel);
        setPrivateField(userData, "numDays", numDays);
        setPrivateField(userData, "targetMuscles", targetMuscles);
        setPrivateField(userData, "availableEquipment", availableEquipment);

        return userData;
    }

    // Helper: get text content of a tag
    private static String getTagValue(Document doc, String tagName) {
        NodeList list = doc.getElementsByTagName(tagName);
        if (list.getLength() == 0) {
            throw new IllegalArgumentException("Missing XML tag: <" + tagName + ">");
        }
        return list.item(0).getTextContent().trim();
    }

    // Helper: set private fields via reflection (temporary until constructor is implemented)
    private static void setPrivateField(Object obj, String fieldName, Object value) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }

    // --- Quick test ---
    public static void main(String[] args) {
        try {
            UserInputData data = createFromXml("workout_config.xml");

            System.out.println("User Goal:      " + data.getUserGoal());
            System.out.println("User Level:     " + data.getUserLevel());
            System.out.println("Num Days:       " + data.getNumDays());
            System.out.println("Target Muscles: " + Arrays.toString(data.getTargetMuscles()));
            System.out.println("Equipment:      " + data.getAvailableEquipment());

        } catch (Exception e) {
            System.err.println("Failed to load workout config: " + e.getMessage());
            e.printStackTrace();
        }
    }
}