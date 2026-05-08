package com.cryptolearn.controller;

import com.cryptolearn.model.Models.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private static final User USER = new User("u-1", "Алексей Иванов", "Студент", 72);

    private static final Progress PROGRESS = new Progress(72, 12, 4, 6, 85);

    private static final List<Topic> TOPICS = List.of(
            new Topic("crypto-basics", "Основы криптографии",
                    "Симметричное и асимметричное шифрование, хеширование", "shield"),
            new Topic("aes-algorithm", "Алгоритм AES",
                    "Детальное изучение работы и структуры AES", "lock"),
            new Topic("practice", "Практика",
                    "Реальные примеры шифрования и расшифрования", "code"),
            new Topic("application", "Применение",
                    "Использование AES в реальных проектах", "zap")
    );

    private static final List<Recommendation> RECS = List.of(
            new Recommendation("rec-1", "video", "Режимы работы блочных шифров",
                    "Изучите различные режимы работы AES: ECB, CBC, CTR, GCM", "Смотреть урок"),
            new Recommendation("rec-2", "test", "Проверка знаний AES",
                    "Пройдите тест и закрепите полученные знания", "Начать тест"),
            new Recommendation("rec-3", "practice", "Генерация ключей",
                    "Попробуйте создать криптостойкие ключи шифрования", "Перейти к практике")
    );

    private static final DailyTip TIP = new DailyTip(
            "AES-256 использует 14 раундов шифрования для максимальной защиты"
    );

    @GetMapping("/dashboard")
    public DashboardPayload dashboard() {
        return new DashboardPayload(USER, PROGRESS, TOPICS, RECS, TIP);
    }

    @GetMapping("/user/me")
    public User me() { return USER; }

    @GetMapping("/progress")
    public Progress progress() { return PROGRESS; }

    @GetMapping("/lessons")
    public List<Lesson> lessons() {
        return List.of(
                new Lesson("l-1", "Введение в криптографию", "История и базовые понятия", 12, true),
                new Lesson("l-2", "Симметричные шифры", "DES, 3DES, AES — обзор", 18, true),
                new Lesson("l-3", "Структура AES", "SubBytes, ShiftRows, MixColumns, AddRoundKey", 24, true),
                new Lesson("l-4", "Раунды AES", "Детали раундов для AES-128/192/256", 21, true),
                new Lesson("l-5", "Режимы работы блочных шифров", "ECB, CBC, CTR, GCM", 20, false),
                new Lesson("l-6", "Атаки на AES", "Side-channel и теоретические атаки", 16, false)
        );
    }

    @GetMapping("/tests")
    public List<TestItem> tests() {
        return List.of(
                new TestItem("t-1", "Основы криптографии", "20 вопросов по базовым понятиям", 20, 90),
                new TestItem("t-2", "Структура AES", "15 вопросов по раундам и преобразованиям", 15, 85),
                new TestItem("t-3", "Режимы работы AES", "12 вопросов по ECB/CBC/CTR/GCM", 12, null),
                new TestItem("t-4", "Безопасность AES", "10 вопросов по атакам и защите", 10, null)
        );
    }

    @GetMapping("/flashcards")
    public List<Flashcard> flashcards() {
        return List.of(
                new Flashcard("f-1", "Размер блока AES?", "128 бит (16 байт)"),
                new Flashcard("f-2", "Длины ключа AES?", "128, 192, 256 бит"),
                new Flashcard("f-3", "Сколько раундов в AES-256?", "14 раундов"),
                new Flashcard("f-4", "Что делает SubBytes?", "Нелинейная замена байт через S-box"),
                new Flashcard("f-5", "Что такое MixColumns?", "Линейное смешивание байт внутри столбца"),
                new Flashcard("f-6", "Режим без вектора инициализации?", "ECB (небезопасный)")
        );
    }

    @GetMapping("/recommendations")
    public List<Recommendation> recommendations() { return RECS; }
}
