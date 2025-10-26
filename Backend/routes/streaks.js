const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');


// @route   GET /api/streaks/calendar/:year/:month
// @desc    Get calendar data for a specific month
// @access  Private
router.get('/calendar/:year/:month', protect, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Validate inputs
    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid year or month' 
      });
    }

    // Get start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get all completions for the month
    const completions = await HabitCompletion.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
      completed: true
    }).populate('habitId', 'name icon');

    // Get all habits to check if ALL are completed for a day
    const habits = await Habit.find({
      userId: req.user._id,
      isActive: true
    });

    // Group completions by date
    const completionsByDate = {};
    completions.forEach(completion => {
      const dateStr = completion.date.toISOString().split('T'); // FIX: Added 
      if (!completionsByDate[dateStr]) {
        completionsByDate[dateStr] = [];
      }
      completionsByDate[dateStr].push(completion);
    });

    // Format calendar data - mark day as completed only if ALL habits are done
    const calendarData = {};
    Object.keys(completionsByDate).forEach(dateStr => {
      const dayCompletions = completionsByDate[dateStr];
      const uniqueHabits = new Set(dayCompletions.map(c => c.habitId.toString()));
      
      // Day is completed if all active habits are done
      const allHabitsCompleted = uniqueHabits.size === habits.length;
      
      calendarData[dateStr] = {
        date: dateStr,
        completed: allHabitsCompleted,
        habits: dayCompletions.map(c => ({
          name: c.habitId.name,
          icon: c.habitId.icon
        }))
      };
    });

    res.json({
      success: true,
      year: parseInt(year),
      month: parseInt(month),
      calendarData
    });
  } catch (error) {
    console.error('Get Calendar Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching calendar data',
      error: error.message 
    });
  }
});


// @route   GET /api/streaks/stats
// @desc    Get streak statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id,
      isActive: true 
    });

    // Calculate current month completion
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get all completions this month
    const completions = await HabitCompletion.find({
      userId: req.user._id,
      date: { $gte: startOfMonth },
      completed: true
    });

    // Calculate stats
    const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
    const maxStreak = Math.max(...habits.map(h => h.streak), 0);
    const bestStreakEver = Math.max(...habits.map(h => h.bestStreak), 0);
    
    // Group completions by date to count unique DAYS (not individual completions)
    const completionsByDate = {};
    completions.forEach(completion => {
      const dateStr = completion.date.toISOString().split('T'); // FIX: Added 
      if (!completionsByDate[dateStr]) {
        completionsByDate[dateStr] = [];
      }
      completionsByDate[dateStr].push(completion);
    });

    // Count only days where ALL habits are completed
    let fullyCompletedDays = 0;
    Object.keys(completionsByDate).forEach(dateStr => {
      const dayCompletions = completionsByDate[dateStr];
      const uniqueHabits = new Set(dayCompletions.map(c => c.habitId.toString()));
      if (uniqueHabits.size === habits.length) {
        fullyCompletedDays++;
      }
    });

    // Days elapsed from start of month to today (inclusive)
    const daysInMonth = now.getDate();
    
    // Calculate completion rate as percentage of fully completed days
    const completionRate = daysInMonth > 0 
      ? Math.round((fullyCompletedDays / daysInMonth) * 100) 
      : 0;

    console.log('[STATS DEBUG]', {
      fullyCompletedDays,
      daysInMonth,
      completionRate,
      habitsCount: habits.length,
      totalCompletions: completions.length
    });

    res.json({
      success: true,
      stats: {
        currentStreak: maxStreak,
        totalStreaks: totalStreak,
        bestStreakEver,
        completedDaysThisMonth: fullyCompletedDays,
        completionRate,
        daysInMonth,
        habitCount: habits.length
      }
    });
  } catch (error) {
    console.error('Get Streak Stats Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching streak statistics',
      error: error.message 
    });
  }
});


// @route   GET /api/streaks/leaderboard
// @desc    Get habits sorted by streak
// @access  Private
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ streak: -1 }).limit(10);

    res.json({
      success: true,
      leaderboard: habits.map(habit => ({
        id: habit._id,
        name: habit.name,
        icon: habit.icon,
        streak: habit.streak,
        bestStreak: habit.bestStreak,
        completionCount: habit.completionCount
      }))
    });
  } catch (error) {
    console.error('Get Leaderboard Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching leaderboard',
      error: error.message 
    });
  }
});

module.exports = router;
