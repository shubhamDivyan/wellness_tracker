const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const AISuggestion = require('../models/AISuggestion');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');

// Mock AI suggestion generator
// In production, replace with actual AI/ML model or API
const generateAISuggestions = async (userId, habits, completionRate) => {
  const suggestions = [];
  
  // Analyze user's current habits
  const categories = habits.map(h => h.category);
  const hasHealthHabit = categories.includes('health');
  const hasFitnessHabit = categories.includes('fitness');
  const hasMindfulnessHabit = categories.includes('mindfulness');
  const hasProductivityHabit = categories.includes('productivity');

  // Suggest based on gaps
  if (!hasHealthHabit || habits.length < 3) {
    suggestions.push({
      habitName: 'Drink Water',
      description: 'Stay hydrated by drinking 8 glasses of water throughout the day',
      reason: 'Proper hydration improves energy levels, cognitive function, and overall health',
      timeCommitment: '2 min per glass',
      difficulty: 'Easy',
      category: 'health'
    });
  }

  if (!hasFitnessHabit && completionRate > 70) {
    suggestions.push({
      habitName: '10-Minute Walk',
      description: 'Take a short walk outside or around your workspace',
      reason: 'Based on your consistency, you\'re ready to add light physical activity',
      timeCommitment: '10 min',
      difficulty: 'Easy',
      category: 'fitness'
    });
  }

  if (!hasMindfulnessHabit) {
    suggestions.push({
      habitName: 'Deep Breathing',
      description: 'Practice 5 minutes of deep breathing exercises',
      reason: 'Reduce stress and improve focus with simple breathing techniques',
      timeCommitment: '5 min',
      difficulty: 'Easy',
      category: 'mindfulness'
    });
  }

  if (!hasProductivityHabit) {
    suggestions.push({
      habitName: 'Morning Planning',
      description: 'Spend 5 minutes planning your day each morning',
      reason: 'Setting intentions helps prioritize tasks and reduce overwhelm',
      timeCommitment: '5 min',
      difficulty: 'Easy',
      category: 'productivity'
    });
  }

  // Advanced suggestions for high performers
  if (completionRate > 85) {
    suggestions.push({
      habitName: 'Gratitude Journaling',
      description: 'Write down 3 things you\'re grateful for each day',
      reason: 'Your strong habit foundation makes this a perfect time to add mindfulness practices',
      timeCommitment: '5 min',
      difficulty: 'Medium',
      category: 'mindfulness'
    });
  }

  // Suggest habit improvements
  const lowStreakHabits = habits.filter(h => h.streak < 5);
  if (lowStreakHabits.length > 0) {
    suggestions.push({
      habitName: 'Habit Stacking',
      description: 'Link your new habits to existing routines for better consistency',
      reason: `You have ${lowStreakHabits.length} habit(s) with low streaks. Habit stacking can help`,
      timeCommitment: 'Varies',
      difficulty: 'Medium',
      category: 'productivity'
    });
  }

  return suggestions.slice(0, 5); // Return top 5 suggestions
};

// @route   GET /api/ai/suggestions
// @desc    Get AI-generated habit suggestions
// @access  Private
router.get('/suggestions', protect, async (req, res) => {
  try {
    // Get user's current habits
    const habits = await Habit.find({
      userId: req.user._id,
      isActive: true
    });

    // Calculate completion rate
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completions = await HabitCompletion.countDocuments({
      userId: req.user._id,
      date: { $gte: thirtyDaysAgo },
      completed: true
    });

    const totalPossible = habits.length * 30;
    const completionRate = totalPossible > 0 
      ? Math.round((completions / totalPossible) * 100) 
      : 0;

    // Generate suggestions
    const generatedSuggestions = await generateAISuggestions(
      req.user._id, 
      habits, 
      completionRate
    );

    // Save suggestions to database
    const savedSuggestions = await Promise.all(
      generatedSuggestions.map(async (suggestion) => {
        // Check if similar suggestion already exists
        const existing = await AISuggestion.findOne({
          userId: req.user._id,
          habitName: suggestion.habitName,
          accepted: false
        });

        if (existing) {
          return existing;
        }

        return await AISuggestion.create({
          userId: req.user._id,
          ...suggestion
        });
      })
    );

    res.json({
      success: true,
      count: savedSuggestions.length,
      suggestions: savedSuggestions,
      userStats: {
        currentHabits: habits.length,
        completionRate
      }
    });
  } catch (error) {
    console.error('Get AI Suggestions Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating suggestions',
      error: error.message 
    });
  }
});

// @route   POST /api/ai/suggestions/:id/accept
// @desc    Accept an AI suggestion and create habit
// @access  Private
router.post('/suggestions/:id/accept', protect, async (req, res) => {
  try {
    const suggestion = await AISuggestion.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!suggestion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Suggestion not found' 
      });
    }

    if (suggestion.accepted) {
      return res.status(400).json({ 
        success: false, 
        message: 'Suggestion already accepted' 
      });
    }

    // Create habit from suggestion
    const habit = await Habit.create({
      userId: req.user._id,
      name: suggestion.habitName,
      description: suggestion.description,
      icon: getIconForCategory(suggestion.category),
      target: suggestion.timeCommitment,
      category: suggestion.category,
      frequency: 'daily'
    });

    // Mark suggestion as accepted
    suggestion.accepted = true;
    await suggestion.save();

    res.status(201).json({
      success: true,
      message: 'Habit created from suggestion',
      habit,
      suggestion
    });
  } catch (error) {
    console.error('Accept Suggestion Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error accepting suggestion',
      error: error.message 
    });
  }
});

// @route   DELETE /api/ai/suggestions/:id
// @desc    Dismiss an AI suggestion
// @access  Private
router.delete('/suggestions/:id', protect, async (req, res) => {
  try {
    const suggestion = await AISuggestion.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!suggestion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Suggestion not found' 
      });
    }

    res.json({
      success: true,
      message: 'Suggestion dismissed'
    });
  } catch (error) {
    console.error('Dismiss Suggestion Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error dismissing suggestion',
      error: error.message 
    });
  }
});

// @route   POST /api/ai/regenerate
// @desc    Regenerate AI suggestions
// @access  Private
router.post('/regenerate', protect, async (req, res) => {
  try {
    // Delete old unaccepted suggestions
    await AISuggestion.deleteMany({
      userId: req.user._id,
      accepted: false
    });

    // Redirect to get new suggestions
    res.redirect('/api/ai/suggestions');
  } catch (error) {
    console.error('Regenerate Suggestions Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error regenerating suggestions',
      error: error.message 
    });
  }
});

// Helper function to get icon based on category
function getIconForCategory(category) {
  const iconMap = {
    health: '💧',
    fitness: '🏃',
    mindfulness: '🧘',
    productivity: '📝',
    social: '👥',
    other: '✅'
  };
  return iconMap[category] || '✅';
}

module.exports = router;
