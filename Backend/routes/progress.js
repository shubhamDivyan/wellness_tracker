const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const MoodEntry = require('../models/MoodEntry');

// @route   GET /api/progress/weekly
// @desc    Get weekly progress data
// @access  Private
router.get('/weekly', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id,
      isActive: true 
    });

    // Get last 4 weeks of data
    const weeklyData = [];
   const today = new Date();
today.setHours(0, 0, 0, 0);

for (let i = 3; i >= 0; i--) {
  // For Week 4 (i=0), end = today
  let weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() - 7 * i);
  weekEnd.setHours(23, 59, 59, 999);

  let weekStart = new Date(weekEnd);
  weekStart.setDate(weekEnd.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const completions = await HabitCompletion.find({
    userId: req.user._id,
    date: { $gte: weekStart, $lte: weekEnd },
    completed: true
  });

  weeklyData.push({
    week: `Week ${4 - i}`,
    completed: completions.length,
    total: habits.length * 7,
    startDate: weekStart,
    endDate: weekEnd
  });
    }

    res.json({
      success: true,
      weeklyData
    });
  } catch (error) {
    console.error('Get Weekly Progress Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching weekly progress',
      error: error.message 
    });
  }
});

// @route   GET /api/progress/habits-completion
// @desc    Get completion percentage for each habit
// @access  Private
router.get('/habits-completion', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id,
      isActive: true 
    });

    // Get completion data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const habitCompletion = await Promise.all(habits.map(async (habit) => {
      const completions = await HabitCompletion.countDocuments({
        userId: req.user._id,
        habitId: habit._id,
        date: { $gte: thirtyDaysAgo },
        completed: true
      });

      const completionRate = Math.round((completions / 30) * 100);

      return {
        name: habit.name,
        icon: habit.icon,
        value: completionRate,
        completions,
        streak: habit.streak
      };
    }));

    res.json({
      success: true,
      habitCompletion: habitCompletion.sort((a, b) => b.value - a.value)
    });
  } catch (error) {
    console.error('Get Habit Completion Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching habit completion data',
      error: error.message 
    });
  }
});

// @route   GET /api/progress/mood-trend
// @desc    Get mood trend for the last 7 days
// @access  Private
router.get('/mood-trend', protect, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const moodEntries = await MoodEntry.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const moodTrend = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayName = daysOfWeek[date.getDay()];
      
      const entry = moodEntries.find(e => 
        e.date.toDateString() === date.toDateString()
      );

      moodTrend.push({
        day: dayName,
        mood: entry ? entry.mood : null,
        date: date.toISOString().split('T')
      });
    }

    res.json({
      success: true,
      moodTrend
    });
  } catch (error) {
    console.error('Get Mood Trend Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching mood trend',
      error: error.message 
    });
  }
});

// @route   POST /api/progress/mood
// @desc    Log mood entry
// @access  Private
router.post('/mood', protect, async (req, res) => {
  try {
    const { mood, notes } = req.body;

    if (!mood || mood < 1 || mood > 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mood must be between 1 and 10' 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if mood already logged today
    let moodEntry = await MoodEntry.findOne({
      userId: req.user._id,
      date: today
    });

    if (moodEntry) {
      moodEntry.mood = mood;
      moodEntry.notes = notes || '';
      await moodEntry.save();
    } else {
      moodEntry = await MoodEntry.create({
        userId: req.user._id,
        date: today,
        mood,
        notes: notes || ''
      });
    }

    res.json({
      success: true,
      message: 'Mood logged successfully',
      moodEntry
    });
  } catch (error) {
    console.error('Log Mood Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error logging mood',
      error: error.message 
    });
  }
});

// @route   GET /api/progress/insights
// @desc    Get personalized insights
// @access  Private
router.get('/insights', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id,
      isActive: true 
    });

    // Get completion data for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentCompletions = await HabitCompletion.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo },
      completed: true
    });

    // Calculate insights
    const bestDay = await HabitCompletion.aggregate([
      {
        $match: {
          userId: req.user._id,
          completed: true
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$date" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bestDayName = bestDay.length > 0 ? daysOfWeek[bestDay._id - 1] : 'N/A';

    const mostConsistent = habits.reduce((max, habit) => 
      habit.streak > (max?.streak || 0) ? habit : max, null
    );

    const needsWork = habits.reduce((min, habit) => 
      habit.streak < (min?.streak || Infinity) ? habit : min, null
    );

    res.json({
      success: true,
      insights: {
        bestDay: bestDayName,
        mostConsistent: mostConsistent ? {
          name: mostConsistent.name,
          icon: mostConsistent.icon,
          streak: mostConsistent.streak
        } : null,
        needsWork: needsWork ? {
          name: needsWork.name,
          icon: needsWork.icon,
          streak: needsWork.streak
        } : null,
        weeklyCompletions: recentCompletions.length,
        totalHabits: habits.length
      }
    });
  } catch (error) {
    console.error('Get Insights Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching insights',
      error: error.message 
    });
  }
});

module.exports = router;
