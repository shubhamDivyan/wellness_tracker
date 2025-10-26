// Date utilities
const getStartOfDay = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date = new Date()) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return getStartOfDay(date);
};

// Streak calculation
const calculateStreak = (completions) => {
  if (!completions.length) return 0;

  const sortedDates = completions
    .map(c => c.date)
    .sort((a, b) => b - a);

  let streak = 0;
  let currentDate = getStartOfDay();

  for (let i = 0; i < sortedDates.length; i++) {
    const completionDate = getStartOfDay(sortedDates[i]);
    
    if (completionDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// Response formatters
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

const errorResponse = (res, message = 'Error', statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined
  });
};

module.exports = {
  getStartOfDay,
  getEndOfDay,
  getDaysAgo,
  calculateStreak,
  successResponse,
  errorResponse
};
