const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Friend = require('../models/Friend');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Habit = require('../models/Habit');

// @route   GET /api/social/friends
// @desc    Get all friends
// @access  Private
router.get('/friends', protect, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { userId: req.user._id, status: 'accepted' },
        { friendId: req.user._id, status: 'accepted' }
      ]
    }).populate('userId friendId', 'name email avatar lastActive');

    // Format friend data
    const formattedFriends = await Promise.all(friends.map(async (friendship) => {
      const friendUser = friendship.userId.toString() === req.user._id.toString()
        ? friendship.friendId
        : friendship.userId;

      // Get friend's habits
      const friendHabits = await Habit.find({
        userId: friendUser._id,
        isActive: true
      }).sort({ streak: -1 }).limit(1);

      const topHabit = friendHabits;
      
      // Calculate completion rate (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const HabitCompletion = require('../models/HabitCompletion');
      const completions = await HabitCompletion.countDocuments({
        userId: friendUser._id,
        date: { $gte: sevenDaysAgo },
        completed: true
      });

      const totalPossible = friendHabits.length * 7;
      const completionRate = totalPossible > 0 
        ? Math.round((completions / totalPossible) * 100) 
        : 0;

      return {
        id: friendUser._id,
        name: friendUser.name,
        email: friendUser.email,
        avatar: friendUser.avatar || friendUser.name.substring(0, 2).toUpperCase(),
        streak: topHabit ? topHabit.streak : 0,
        completionRate,
        lastActive: friendUser.lastActive,
        topHabit: topHabit ? topHabit.name : 'No habits yet'
      };
    }));

    res.json({
      success: true,
      count: formattedFriends.length,
      friends: formattedFriends
    });
  } catch (error) {
    console.error('Get Friends Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching friends',
      error: error.message 
    });
  }
});

// @route   POST /api/social/friends/request
// @desc    Send friend request
// @access  Private
router.post('/friends/request', protect, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Find user by email
    const friendUser = await User.findOne({ email });

    if (!friendUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (friendUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot add yourself as a friend' 
      });
    }

    // Check if friendship already exists
    const existingFriendship = await Friend.findOne({
      $or: [
        { userId: req.user._id, friendId: friendUser._id },
        { userId: friendUser._id, friendId: req.user._id }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ 
        success: false, 
        message: existingFriendship.status === 'pending' 
          ? 'Friend request already sent' 
          : 'Already friends' 
      });
    }

    // Create friend request
    const friendRequest = await Friend.create({
      userId: req.user._id,
      friendId: friendUser._id,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      friendRequest
    });
  } catch (error) {
    console.error('Send Friend Request Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending friend request',
      error: error.message 
    });
  }
});

// @route   PUT /api/social/friends/:id/accept
// @desc    Accept friend request
// @access  Private
router.put('/friends/:id/accept', protect, async (req, res) => {
  try {
    const friendship = await Friend.findOne({
      _id: req.params.id,
      friendId: req.user._id,
      status: 'pending'
    });

    if (!friendship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Friend request not found' 
      });
    }

    friendship.status = 'accepted';
    await friendship.save();

    res.json({
      success: true,
      message: 'Friend request accepted',
      friendship
    });
  } catch (error) {
    console.error('Accept Friend Request Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error accepting friend request',
      error: error.message 
    });
  }
});

// @route   DELETE /api/social/friends/:id
// @desc    Remove friend or decline request
// @access  Private
router.delete('/friends/:id', protect, async (req, res) => {
  try {
    const friendship = await Friend.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { friendId: req.user._id }
      ]
    });

    if (!friendship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Friendship not found' 
      });
    }

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove Friend Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error removing friend',
      error: error.message 
    });
  }
});

// @route   GET /api/social/activity
// @desc    Get activity feed from friends
// @access  Private
router.get('/activity', protect, async (req, res) => {
  try {
    // Get friend IDs
    const friendships = await Friend.find({
      $or: [
        { userId: req.user._id, status: 'accepted' },
        { friendId: req.user._id, status: 'accepted' }
      ]
    });

    const friendIds = friendships.map(f => 
      f.userId.toString() === req.user._id.toString() ? f.friendId : f.userId
    );

    // Get activities from friends
    const activities = await Activity.find({
      userId: { $in: friendIds }
    })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(50);

    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      friendName: activity.userId.name,
      avatar: activity.userId.avatar,
      action: activity.action,
      icon: activity.icon,
      timestamp: activity.createdAt,
      metadata: activity.metadata
    }));

    res.json({
      success: true,
      count: formattedActivities.length,
      activities: formattedActivities
    });
  } catch (error) {
    console.error('Get Activity Feed Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching activity feed',
      error: error.message 
    });
  }
});

// @route   GET /api/social/pending
// @desc    Get pending friend requests
// @access  Private
router.get('/pending', protect, async (req, res) => {
  try {
    const pendingRequests = await Friend.find({
      friendId: req.user._id,
      status: 'pending'
    }).populate('userId', 'name email avatar');

    res.json({
      success: true,
      count: pendingRequests.length,
      requests: pendingRequests
    });
  } catch (error) {
    console.error('Get Pending Requests Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching pending requests',
      error: error.message 
    });
  }
});

// @route   POST /api/social/share
// @desc    Share progress/achievement
// @access  Private
router.post('/share', protect, async (req, res) => {
  try {
    const { message, type, metadata } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    const activity = await Activity.create({
      userId: req.user._id,
      action: message,
      icon: type === 'streak' ? '🔥' : type === 'achievement' ? '🏆' : '📊',
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      message: 'Progress shared successfully',
      activity
    });
  } catch (error) {
    console.error('Share Progress Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sharing progress',
      error: error.message 
    });
  }
});

module.exports = router;
