const express = require('express');
const axios = require('axios');
const HealthLog = require('../models/HealthLog');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper to call OpenRouter API
async function callOpenRouter(messages, max_tokens = 500, temperature = 0.7) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'minimax/minimax-m2:free',
        messages,
        max_tokens,
        temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://healthmateai-frontend.onrender.com',
          'X-Title': 'HealthMate',
          'Content-Type': 'application/json'
        }
      }
    );
    const message = response.data.choices[0].message;
    console.log('OpenRouter API choices[0].message:', message);

    // Prefer content, fallback to reasoning or reasoning_details[0].summary
    let aiContent = message.content;
    if (!aiContent || aiContent.trim() === '') {
      if (message.reasoning) {
        aiContent = message.reasoning;
      } else if (Array.isArray(message.reasoning_details) && message.reasoning_details[0]?.summary) {
        aiContent = message.reasoning_details[0].summary;
      } else {
        aiContent = 'Sorry, the AI service is temporarily unavailable. Please try again later.';
      }
    }
    // Limit response to 100 words for concise UI display
    const words = aiContent.split(/\s+/);
    if (words.length > 100) {
      aiContent = words.slice(0, 100).join(' ') + '...';
    }
    return aiContent;
  } catch (error) {
    if (error.response) {
      console.error('OpenRouter API error:', error.response.data);
      return error.response.data?.error?.message || 'OpenRouter API error';
    } else {
      console.error('OpenRouter API error:', error.message);
      return 'OpenRouter API error: ' + error.message;
    }
  }
}

// Generate daily health summary and recommendations
router.post('/daily-summary', auth, async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();

    // Get user profile
    const user = await User.findById(req.userId).select('-password');

    // Get health log for the specified date
    const log = await HealthLog.findOne({
      userId: req.userId,
      date: {
        $gte: new Date(targetDate.toDateString()),
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!log) {
      return res.status(404).json({ message: 'No health data found for this date' });
    }

    // Get recent logs for trend analysis (last 7 days)
    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - 7);

    const recentLogs = await HealthLog.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: targetDate }
    }).sort({ date: 1 });

    // Prepare data for AI analysis
    const healthData = {
      userProfile: {
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activityLevel: user.activityLevel,
        healthGoals: user.healthGoals
      },
      todayData: {
        steps: log.steps,
        sleep: log.sleep,
        diet: log.diet,
        exercise: log.exercise,
        mood: log.mood,
        energy: log.energy,
        weight: log.weight
      },
      weeklyTrend: recentLogs.map(l => ({
        date: l.date,
        steps: l.steps?.count || 0,
        sleep: l.sleep?.duration || 0,
        calories: l.diet?.totalCalories || 0,
        mood: l.mood,
        energy: l.energy
      }))
    };

    // Generate AI summary
    const prompt = `
    As a health AI assistant, analyze this user's health data and provide a comprehensive daily summary with personalized recommendations.

    User Profile:
    - Age: ${healthData.userProfile.age}
    - Gender: ${healthData.userProfile.gender}
    - Height: ${healthData.userProfile.height}cm
    - Weight: ${healthData.userProfile.weight}kg
    - Activity Level: ${healthData.userProfile.activityLevel}
    - Health Goals: ${healthData.userProfile.healthGoals?.join(', ')}

    Today's Data:
    - Steps: ${healthData.todayData.steps?.count || 0} (Goal: ${healthData.todayData.steps?.goal || 10000})
    - Sleep: ${healthData.todayData.sleep?.duration || 'Not recorded'} hours
    - Sleep Quality: ${healthData.todayData.sleep?.quality || 'Not recorded'}
    - Total Calories: ${healthData.todayData.diet?.totalCalories || 0}
    - Water Intake: ${healthData.todayData.diet?.waterIntake || 0} glasses
    - Workouts: ${healthData.todayData.exercise?.length || 0}
    - Mood: ${healthData.todayData.mood || 'Not recorded'}
    - Energy Level: ${healthData.todayData.energy || 'Not recorded'}/10

    Weekly Trends:
    ${healthData.weeklyTrend.map(day =>
      `${day.date.toDateString()}: ${day.steps} steps, ${day.sleep}h sleep, ${day.calories} cal, mood: ${day.mood || 'N/A'}, energy: ${day.energy || 'N/A'}`
    ).join('\n')}

    Please provide:
    1. A brief summary of today's health metrics
    2. 3-5 specific, actionable recommendations based on the data and trends
    3. Identification of any concerning patterns
    4. Positive reinforcement for good habits
    5. Tomorrow's focus areas

    Keep the response concise but insightful, focusing on practical advice.
    `;

    const aiSummary = await callOpenRouter(
      [{ role: "user", content: prompt }],
      500,
      0.7
    );

    // Extract recommendations (simple parsing)
    const recommendations = aiSummary
      .split('\n')
      .filter(line => line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.'))
      .slice(0, 5);

    // Update the health log with AI insights
    log.aiSummary = aiSummary;
    log.aiRecommendations = recommendations;
    await log.save();

    res.json({
      summary: aiSummary,
      recommendations,
      healthScore: calculateHealthScore(healthData.todayData),
      trends: analyzeTrends(healthData.weeklyTrend)
    });

  } catch (error) {
    console.error('AI Summary error:', error);

    // Handle specific OpenAI quota error
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        message: 'OpenAI quota exceeded. Please check your billing and usage limits.',
        suggestions: [
          'Visit https://platform.openai.com/account/billing',
          'Add a payment method or purchase credits',
          'Check your current usage and limits'
        ],
        fallback: 'You can still use all other features of HealthMate - health logging, analytics, and profile management work without AI.'
      });
    }

    res.status(500).json({ message: 'Error generating AI summary' });
  }
});

// Health chatbot
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;

    // Get user profile for context
    const user = await User.findById(req.userId).select('-password');

    // Get recent health data for context
    const recentLog = await HealthLog.findOne({
      userId: req.userId
    }).sort({ date: -1 });

    const systemPrompt = `
    You are HealthMate AI, a knowledgeable and supportive health assistant. You help users with:
    - Nutrition advice and meal planning
    - Exercise recommendations and workout plans
    - Sleep optimization tips
    - General wellness guidance
    - Motivation and encouragement

    User Context:
    - Age: ${user.age || 'Not specified'}
    - Gender: ${user.gender || 'Not specified'}
    - Height: ${user.height || 'Not specified'}cm
    - Weight: ${user.weight || 'Not specified'}kg
    - Activity Level: ${user.activityLevel || 'Not specified'}
    - Health Goals: ${user.healthGoals?.join(', ') || 'Not specified'}

    Recent Activity:
    - Recent Steps: ${recentLog?.steps?.count || 'Not recorded'}
    - Recent Sleep: ${recentLog?.sleep?.duration || 'Not recorded'} hours
    - Recent Mood: ${recentLog?.mood || 'Not recorded'}
    - Recent Energy: ${recentLog?.energy || 'Not recorded'}/10

    Provide helpful, personalized advice. Be encouraging and supportive. If asked about serious medical conditions, remind the user to consult healthcare professionals.
    `;

    const chatResponse = await callOpenRouter(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      300,
      0.8
    );
    res.json({
      response: chatResponse,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Chatbot error:', error);

    // Handle specific OpenAI quota error
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        message: 'AI chat quota exceeded. Please check your OpenAI billing.',
        suggestions: [
          'Visit https://platform.openai.com/account/billing',
          'Add credits to continue using AI features'
        ],
        fallback: 'While AI chat is unavailable, you can still log health data, view analytics, and track your progress!'
      });
    }

    res.status(500).json({ message: 'Error processing chat message' });
  }
});

// Predict health trends
router.get('/predictions', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Get historical data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await HealthLog.find({
      userId: req.userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    if (logs.length < 7) {
      return res.json({
        message: 'Need at least 7 days of data for predictions',
        predictions: []
      });
    }

    // Analyze patterns and generate predictions
    const predictions = await generatePredictions(logs);

    res.json({ predictions });

  } catch (error) {
    console.error('Predictions error:', error);
    res.status(500).json({ message: 'Error generating predictions' });
  }
});

// Helper functions
function calculateHealthScore(todayData) {
  let score = 0;
  let maxScore = 0;

  // Steps score (25 points)
  if (todayData.steps?.count) {
    const stepsScore = Math.min(25, (todayData.steps.count / todayData.steps.goal) * 25);
    score += stepsScore;
  }
  maxScore += 25;

  // Sleep score (25 points)
  if (todayData.sleep?.duration) {
    const sleepScore = todayData.sleep.duration >= 7 && todayData.sleep.duration <= 9 ? 25 :
                     todayData.sleep.duration >= 6 && todayData.sleep.duration <= 10 ? 20 : 15;
    score += sleepScore;
  }
  maxScore += 25;

  // Energy score (25 points)
  if (todayData.energy) {
    score += (todayData.energy / 10) * 25;
  }
  maxScore += 25;

  // Exercise score (25 points)
  if (todayData.exercise?.length > 0) {
    score += 25;
  }
  maxScore += 25;

  return Math.round((score / maxScore) * 100);
}

function analyzeTrends(weeklyData) {
  const trends = {};

  if (weeklyData.length >= 3) {
    const recent = weeklyData.slice(-3);
    const earlier = weeklyData.slice(0, 3);

    // Steps trend
    const recentSteps = recent.reduce((sum, day) => sum + day.steps, 0) / recent.length;
    const earlierSteps = earlier.reduce((sum, day) => sum + day.steps, 0) / earlier.length;
    trends.steps = recentSteps > earlierSteps ? 'improving' : recentSteps < earlierSteps ? 'declining' : 'stable';

    // Sleep trend
    const recentSleep = recent.reduce((sum, day) => sum + day.sleep, 0) / recent.length;
    const earlierSleep = earlier.reduce((sum, day) => sum + day.sleep, 0) / earlier.length;
    trends.sleep = recentSleep > earlierSleep ? 'improving' : recentSleep < earlierSleep ? 'declining' : 'stable';
  }

  return trends;
}

async function generatePredictions(logs) {
  // Simple pattern analysis - in a real app, you'd use more sophisticated ML
  const predictions = [];

  // Sleep pattern prediction
  const sleepData = logs.map(log => log.sleep?.duration || 0).filter(d => d > 0);
  if (sleepData.length >= 7) {
    const avgSleep = sleepData.reduce((sum, hours) => sum + hours, 0) / sleepData.length;
    const recentSleep = sleepData.slice(-3).reduce((sum, hours) => sum + hours, 0) / 3;

    if (recentSleep < 6) {
      predictions.push({
        type: 'sleep',
        message:`You've averaged ${recentSleep.toFixed(1)} hours of sleep recently. Expect lower energy and focus if this pattern continues.`,
        severity: 'high',
        recommendation: 'Try to get 7-9 hours of sleep tonight for better performance tomorrow.'
      });
    }
  }

  // Steps pattern prediction
  const stepsData = logs.map(log => log.steps?.count || 0);
  const avgSteps = stepsData.reduce((sum, steps) => sum + steps, 0) / stepsData.length;
  const recentSteps = stepsData.slice(-3).reduce((sum, steps) => sum + steps, 0) / 3;

  if (recentSteps < avgSteps * 0.7) {
    predictions.push({
      type: 'activity',
      message: 'Your activity level has decreased significantly. This may impact your energy and mood.',
      severity: 'medium',
      recommendation: 'Consider scheduling a 20-30 minute walk or workout today.'
    });
  }

  return predictions;
}

module.exports = router;
