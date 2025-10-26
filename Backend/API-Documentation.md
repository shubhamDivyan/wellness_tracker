# Complete API Routes Summary

## Base URL
```
http://localhost:5000/api
```

## Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/signup` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/me` | Get current user | Private |
| PUT | `/auth/profile` | Update user profile | Private |

### Request/Response Examples

**POST /api/auth/signup**
```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "",
    "createdAt": "2025-10-26T00:00:00.000Z"
  }
}
```

**POST /api/auth/login**
```json
// Request
{
  "email": "john@example.com",
  "password": "password123"
}

// Response (same as signup)
```

---

## Habit Routes (`/api/habits`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/habits` | Get all user habits | Private |
| GET | `/habits/:id` | Get single habit | Private |
| POST | `/habits` | Create new habit | Private |
| PUT | `/habits/:id` | Update habit | Private |
| DELETE | `/habits/:id` | Delete habit (soft) | Private |
| POST | `/habits/:id/complete` | Toggle habit completion | Private |
| GET | `/habits/today/status` | Get today's completion status | Private |

### Request/Response Examples

**POST /api/habits**
```json
// Request
{
  "name": "Morning Exercise",
  "description": "30 minutes of yoga or cardio",
  "icon": "🏃",
  "target": "30 min",
  "category": "fitness",
  "frequency": "daily"
}

// Response
{
  "success": true,
  "message": "Habit created successfully",
  "habit": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "name": "Morning Exercise",
    "description": "30 minutes of yoga or cardio",
    "icon": "🏃",
    "target": "30 min",
    "category": "fitness",
    "frequency": "daily",
    "streak": 0,
    "bestStreak": 0,
    "completionCount": 0,
    "isActive": true,
    "createdAt": "2025-10-26T00:00:00.000Z"
  }
}
```

**POST /api/habits/:id/complete**
```json
// Request
{
  "notes": "Completed 30 min yoga session"
}

// Response
{
  "success": true,
  "message": "Habit marked as completed",
  "completion": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439010",
    "habitId": "507f1f77bcf86cd799439011",
    "date": "2025-10-26T00:00:00.000Z",
    "completed": true,
    "notes": "Completed 30 min yoga session"
  },
  "habit": {
    "_id": "507f1f77bcf86cd799439011",
    "streak": 1,
    "bestStreak": 1,
    "completionCount": 1
  }
}
```

**GET /api/habits/today/status**
```json
// Response
{
  "success": true,
  "habits": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Morning Exercise",
      "icon": "🏃",
      "completed": true,
      "streak": 5,
      "target": "30 min"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Drink Water",
      "icon": "💧",
      "completed": false,
      "streak": 12,
      "target": "8 glasses"
    }
  ],
  "stats": {
    "completedCount": 1,
    "totalCount": 2,
    "completionPercentage": 50
  }
}
```

---

## Streak Routes (`/api/streaks`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/streaks/calendar/:year/:month` | Get calendar data | Private |
| GET | `/streaks/stats` | Get streak statistics | Private |
| GET | `/streaks/leaderboard` | Get habits by streak | Private |

### Request/Response Examples

**GET /api/streaks/calendar/2025/10**
```json
// Response
{
  "success": true,
  "year": 2025,
  "month": 10,
  "calendarData": {
    "2025-10-01": {
      "date": "2025-10-01",
      "completed": true,
      "habits": [
        { "name": "Exercise", "icon": "🏃" },
        { "name": "Water", "icon": "💧" }
      ]
    },
    "2025-10-02": {
      "date": "2025-10-02",
      "completed": true,
      "habits": [
        { "name": "Meditation", "icon": "🧘" }
      ]
    }
  }
}
```

**GET /api/streaks/stats**
```json
// Response
{
  "success": true,
  "stats": {
    "currentStreak": 12,
    "totalStreaks": 45,
    "bestStreakEver": 23,
    "completedDaysThisMonth": 20,
    "completionRate": 87,
    "daysInMonth": 31,
    "habitCount": 6
  }
}
```

---

## Progress Routes (`/api/progress`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/progress/weekly` | Get weekly progress data | Private |
| GET | `/progress/habits-completion` | Get completion % per habit | Private |
| GET | `/progress/mood-trend` | Get 7-day mood trend | Private |
| POST | `/progress/mood` | Log mood entry | Private |
| GET | `/progress/insights` | Get personalized insights | Private |

### Request/Response Examples

**GET /api/progress/weekly**
```json
// Response
{
  "success": true,
  "weeklyData": [
    {
      "week": "Week 1",
      "completed": 18,
      "total": 42,
      "startDate": "2025-09-30T00:00:00.000Z",
      "endDate": "2025-10-06T23:59:59.999Z"
    },
    {
      "week": "Week 2",
      "completed": 20,
      "total": 42
    }
  ]
}
```

**GET /api/progress/habits-completion**
```json
// Response
{
  "success": true,
  "habitCompletion": [
    {
      "name": "Water Intake",
      "icon": "💧",
      "value": 95,
      "completions": 29,
      "streak": 12
    },
    {
      "name": "Exercise",
      "icon": "🏃",
      "value": 65,
      "completions": 20,
      "streak": 5
    }
  ]
}
```

**POST /api/progress/mood**
```json
// Request
{
  "mood": 8,
  "notes": "Great day, accomplished all goals"
}

// Response
{
  "success": true,
  "message": "Mood logged successfully",
  "moodEntry": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439010",
    "date": "2025-10-26T00:00:00.000Z",
    "mood": 8,
    "notes": "Great day, accomplished all goals"
  }
}
```

**GET /api/progress/insights**
```json
// Response
{
  "success": true,
  "insights": {
    "bestDay": "Friday",
    "mostConsistent": {
      "name": "Sleep",
      "icon": "😴",
      "streak": 15
    },
    "needsWork": {
      "name": "Journaling",
      "icon": "📝",
      "streak": 2
    },
    "weeklyCompletions": 35,
    "totalHabits": 6
  }
}
```

---

## Social Routes (`/api/social`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/social/friends` | Get all friends | Private |
| POST | `/social/friends/request` | Send friend request | Private |
| PUT | `/social/friends/:id/accept` | Accept friend request | Private |
| DELETE | `/social/friends/:id` | Remove friend | Private |
| GET | `/social/activity` | Get friends' activity feed | Private |
| GET | `/social/pending` | Get pending requests | Private |
| POST | `/social/share` | Share progress | Private |

### Request/Response Examples

**POST /api/social/friends/request**
```json
// Request
{
  "email": "friend@example.com"
}

// Response
{
  "success": true,
  "message": "Friend request sent successfully",
  "friendRequest": {
    "_id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439010",
    "friendId": "507f1f77bcf86cd799439016",
    "status": "pending"
  }
}
```

**GET /api/social/friends**
```json
// Response
{
  "success": true,
  "count": 3,
  "friends": [
    {
      "id": "507f1f77bcf86cd799439016",
      "name": "Sarah Chen",
      "email": "sarah@example.com",
      "avatar": "SC",
      "streak": 28,
      "completionRate": 92,
      "lastActive": "2025-10-26T00:00:00.000Z",
      "topHabit": "Exercise"
    }
  ]
}
```

**GET /api/social/activity**
```json
// Response
{
  "success": true,
  "count": 10,
  "activities": [
    {
      "id": "507f1f77bcf86cd799439017",
      "friendName": "Sarah Chen",
      "avatar": "SC",
      "action": "reached a 28-day streak",
      "icon": "🔥",
      "timestamp": "2025-10-26T00:00:00.000Z"
    }
  ]
}
```

---

## AI Suggestions Routes (`/api/ai`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/ai/suggestions` | Get AI suggestions | Private |
| POST | `/ai/suggestions/:id/accept` | Accept suggestion | Private |
| DELETE | `/ai/suggestions/:id` | Dismiss suggestion | Private |
| POST | `/ai/regenerate` | Regenerate suggestions | Private |

### Request/Response Examples

**GET /api/ai/suggestions**
```json
// Response
{
  "success": true,
  "count": 5,
  "suggestions": [
    {
      "_id": "507f1f77bcf86cd799439018",
      "userId": "507f1f77bcf86cd799439010",
      "habitName": "Drink Water",
      "description": "Stay hydrated by drinking 8 glasses of water",
      "reason": "Proper hydration improves energy and health",
      "timeCommitment": "2 min per glass",
      "difficulty": "Easy",
      "category": "health",
      "accepted": false
    }
  ],
  "userStats": {
    "currentHabits": 4,
    "completionRate": 75
  }
}
```

**POST /api/ai/suggestions/:id/accept**
```json
// Response
{
  "success": true,
  "message": "Habit created from suggestion",
  "habit": {
    "_id": "507f1f77bcf86cd799439019",
    "name": "Drink Water",
    "description": "Stay hydrated by drinking 8 glasses of water",
    "icon": "💧",
    "category": "health"
  },
  "suggestion": {
    "_id": "507f1f77bcf86cd799439018",
    "accepted": true
  }
}
```

---

## Authentication Header

All private routes require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Responses

All routes follow consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error
