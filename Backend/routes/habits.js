const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const Activity = require('../models/Activity');

// @route   GET /api/habits
// @desc    Get all habits for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: habits.length,
      habits
    });
  } catch (error) {
    console.error('Get Habits Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching habits',
      error: error.message 
    });
  }
});

// @route   GET /api/habits/:id
// @desc    Get single habit by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
    }

    res.json({
      success: true,
      habit
    });
  } catch (error) {
    console.error('Get Habit Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching habit',
      error: error.message 
    });
  }
});

// @route   POST /api/habits
// @desc    Create a new habit
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, icon, target, category, frequency } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Habit name is required' 
      });
    }

    const habit = await Habit.create({
      userId: req.user._id,
      name,
      description,
      icon: icon || '✅',
      target: target || '1 time',
      category: category || 'other',
      frequency: frequency || 'daily'
    });

    // Create activity
    await Activity.create({
      userId: req.user._id,
      action: `created a new habit: ${name}`,
      icon: '🎯',
      metadata: { habitId: habit._id }
    });

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      habit
    });
  } catch (error) {
    console.error('Create Habit Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating habit',
      error: error.message 
    });
  }
});

// @route   PUT /api/habits/:id
// @desc    Update a habit
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, icon, target, category, frequency } = req.body;

    let habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
    }

    habit = await Habit.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, target, category, frequency },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Habit updated successfully',
      habit
    });
  } catch (error) {
    console.error('Update Habit Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating habit',
      error: error.message 
    });
  }
});

// @route   DELETE /api/habits/:id
// @desc    Delete (soft delete) a habit
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
    }

    // Soft delete
    habit.isActive = false;
    await habit.save();

    res.json({
      success: true,
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    console.error('Delete Habit Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting habit',
      error: error.message 
    });
  }
});

// @route   POST /api/habits/:id/complete
// @desc    Toggle habit completion for today
// @access  Private
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already completed today
    const existingCompletion = await HabitCompletion.findOne({
      userId: req.user._id,
      habitId: habit._id,
      date: today
    });

    if (existingCompletion) {
      // Toggle completion
      existingCompletion.completed = !existingCompletion.completed;
      await existingCompletion.save();

      // Update streak
      if (!existingCompletion.completed) {
        habit.streak = Math.max(0, habit.streak - 1);
      } else {
        habit.streak += 1;
        if (habit.streak > habit.bestStreak) {
          habit.bestStreak = habit.streak;
        }
      }
      await habit.save();

      return res.json({
        success: true,
        message: `Habit marked as ${existingCompletion.completed ? 'completed' : 'incomplete'}`,
        completion: existingCompletion,
        habit
      });
    }

    // Create new completion
    const completion = await HabitCompletion.create({
      userId: req.user._id,
      habitId: habit._id,
      date: today,
      completed: true,
      notes: req.body.notes || ''
    });

    // Update habit stats
    habit.streak += 1;
    habit.completionCount += 1;
    if (habit.streak > habit.bestStreak) {
      habit.bestStreak = habit.streak;
    }
    await habit.save();

    // Create activity if milestone
    if (habit.streak % 7 === 0) {
      await Activity.create({
        userId: req.user._id,
        action: `reached a ${habit.streak}-day streak on ${habit.name}`,
        icon: '🔥',
        metadata: { habitId: habit._id, streak: habit.streak }
      });
    }

    res.json({
      success: true,
      message: 'Habit marked as completed',
      completion,
      habit
    });
  } catch (error) {
    console.error('Complete Habit Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error completing habit',
      error: error.message 
    });
  }
});

// @route   GET /api/habits/today/status
// @desc    Get today's habit completion status
// @access  Private
router.get('/today/status', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id,
      isActive: true 
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completions = await HabitCompletion.find({
      userId: req.user._id,
      date: today,
      completed: true
    });

    const completedHabitIds = completions.map(c => c.habitId.toString());

    const habitStatus = habits.map(habit => ({
      ...habit.toObject(),
      completed: completedHabitIds.includes(habit._id.toString())
    }));

    const completedCount = completions.length;
    const totalCount = habits.length;
    const completionPercentage = totalCount > 0 
      ? Math.round((completedCount / totalCount) * 100) 
      : 0;

    res.json({
      success: true,
      habits: habitStatus,
      stats: {
        completedCount,
        totalCount,
        completionPercentage
      }
    });
  } catch (error) {
    console.error('Get Today Status Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching today\'s status',
      error: error.message 
    });
  }
});

module.exports = router;
