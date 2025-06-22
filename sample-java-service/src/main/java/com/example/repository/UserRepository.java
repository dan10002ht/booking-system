package com.example.repository;

import com.example.model.User;
import org.springframework.stereotype.Repository;
import java.util.Map;

@Repository
public class UserRepository {
    private static final Map<String, User> users = Map.of(
        "1", new User("1", "Alice"),
        "2", new User("2", "Bob")
    );

    public User findById(String id) {
        return users.get(id);
    }
} 