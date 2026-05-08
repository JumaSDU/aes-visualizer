package com.cryptolearn.model;

import java.util.List;

public class Models {

    public record User(String id, String name, String role, int courseProgress) {}

    public record Progress(int percent, int testsCompleted, int videosWatched, int videosTotal, int averageScore) {}

    public record Topic(String id, String title, String description, String icon) {}

    public record Recommendation(String id, String type, String title, String description, String cta) {}

    public record Lesson(String id, String title, String description, int durationMinutes, boolean watched) {}

    public record TestItem(String id, String title, String description, int questions, Integer lastScore) {}

    public record Flashcard(String id, String front, String back) {}

    public record DailyTip(String text) {}

    public record DashboardPayload(
            User user,
            Progress progress,
            List<Topic> topics,
            List<Recommendation> recommendations,
            DailyTip tip
    ) {}
}
