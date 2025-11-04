const express = require('express');
const HealthLog = require('../models/HealthLog');
const auth = require('../middleware/auth');

const router = express.Router();

// Create or update daily health log
router.post('/log', auth, async (req, res) => {
  try {
    const {
      date,
      steps,
      sleep,
      diet,
      mood,
      energy,
      weight,
      notes
    } = req.body;

    const today = new Date().toDateString();

    // Find or create today's log
    let log = await HealthLog.findOne({
      userId: req.userId,
      date: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!log) {
      // Create new log with proper structure
      log = new HealthLog({
        userId: req.userId,
        date: new Date(),
        steps: { count: 0, goal: 10000, caloriesBurned: 0 },
        sleep: {},
        diet: { meals: [], waterIntake: 0, totalCalories: 0 }
      });
    }

    // Merge fields instead of overwriting
    if (steps) {
      log.steps = { ...log.steps, ...steps };
    }
    if (sleep) {
      log.sleep = { ...log.sleep, ...sleep };
    }
    if (diet) {
      log.diet = { ...log.diet, ...diet, meals: log.diet.meals };
      // Only update waterIntake/totalCalories if provided, keep meals array
      if (diet.waterIntake !== undefined) log.diet.waterIntake = diet.waterIntake;
      if (diet.totalCalories !== undefined) log.diet.totalCalories = diet.totalCalories;
    }
    if (mood !== undefined) log.mood = mood;
    if (energy !== undefined) log.energy = energy;
    if (weight !== undefined) log.weight = weight;
    if (notes !== undefined) log.notes = notes;

    // Ensure proper structure before saving
    if (!log.diet) log.diet = { meals: [], waterIntake: 0, totalCalories: 0 };
    if (!log.diet.meals) log.diet.meals = [];

    // Mark all fields as modified for MongoDB
    log.markModified('steps');
    log.markModified('sleep');
    log.markModified('diet');

    await log.save();

    res.json({ message: 'Health log updated successfully', log });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating health log' });
  }
});

// Get health logs for a date range
router.get('/logs', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;

    let query = { userId: req.userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const logs = await HealthLog.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error retrieving health logs' });
  }
});

// Get today's health log
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toDateString();
    const log = await HealthLog.findOne({
      userId: req.userId,
      date: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!log) {
      // Create empty log for today with proper structure
      const newLog = new HealthLog({
        userId: req.userId,
        date: new Date(),
        steps: { count: 0, goal: 10000, caloriesBurned: 0 },
        sleep: {},
        diet: { meals: [], waterIntake: 0, totalCalories: 0 }
      });
      await newLog.save();
      return res.json(newLog);
    }

    // Ensure proper structure exists before returning
    if (!log.diet) {
      log.diet = { meals: [], waterIntake: 0, totalCalories: 0 };
    }
    if (!log.diet.meals) {
      log.diet.meals = [];
    }

    res.json(log);
  } catch (error) {
    console.error('Get today log error:', error);
    res.status(500).json({ message: 'Server error retrieving today\'s log' });
  }
});

// Get health analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysBack = parseInt(days);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const logs = await HealthLog.find({
      userId: req.userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Calculate analytics
    const analytics = {
      averageSteps: 0,
      averageSleep: 0,
      averageCalories: 0,
      averageEnergy: 0,
      stepsTrend: [],
      sleepTrend: [],
      caloriesTrend: [],
      energyTrend: [],
      moodDistribution: {},
      totalWorkouts: 0
    };

    if (logs.length > 0) {
      let totalSteps = 0, totalSleep = 0, totalCalories = 0, totalEnergy = 0;

      logs.forEach(log => {
        totalSteps += log.steps?.count || 0;
        totalSleep += log.sleep?.duration || 0;
        totalCalories += log.diet?.totalCalories || 0;
        totalEnergy += log.energy || 0;

        analytics.stepsTrend.push({
          date: log.date,
          value: log.steps?.count || 0
        });

        analytics.sleepTrend.push({
          date: log.date,
          value: log.sleep?.duration || 0
        });

        analytics.caloriesTrend.push({
          date: log.date,
          value: log.diet?.totalCalories || 0
        });

        analytics.energyTrend.push({
          date: log.date,
          value: log.energy || 0
        });

        if (log.mood) {
          analytics.moodDistribution[log.mood] = (analytics.moodDistribution[log.mood] || 0) + 1;
        }

        analytics.totalWorkouts += log.exercise?.length || 0;
      });

      analytics.averageSteps = Math.round(totalSteps / logs.length);
      analytics.averageSleep = Math.round((totalSleep / logs.length) * 10) / 10;
      analytics.averageCalories = Math.round(totalCalories / logs.length);
      analytics.averageEnergy = Math.round((totalEnergy / logs.length) * 10) / 10;
    }

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error calculating analytics' });
  }
});

// Add meal to today's log
router.post('/meal', auth, async (req, res) => {
  try {
    const { meal } = req.body;
    const today = new Date().toDateString();

    let log = await HealthLog.findOne({
      userId: req.userId,
      date: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!log) {
      log = new HealthLog({
        userId: req.userId,
        date: new Date(),
        steps: { count: 0, goal: 10000, caloriesBurned: 0 },
        sleep: {},
        diet: { meals: [], waterIntake: 0, totalCalories: 0 }
      });
    }

    // Ensure diet object exists with proper structure
    if (!log.diet) log.diet = { meals: [], waterIntake: 0, totalCalories: 0 };
    if (!log.diet.meals) log.diet.meals = [];

    // Add the new meal (without time)
    const newMeal = {
      name: meal.name || '',
      type: meal.type || 'snack',
      calories: parseInt(meal.calories) || 0,
      protein: parseInt(meal.protein) || 0
    };
    log.diet.meals.push(newMeal);
    log.diet.totalCalories = log.diet.meals.reduce((total, m) => total + (parseInt(m.calories) || 0), 0);
    log.markModified('diet');
    await log.save();
    res.json({ message: 'Meal added successfully', log: log, totalCalories: log.diet.totalCalories });
  } catch (error) {
    res.status(500).json({ message: 'Server error adding meal' });
  }
});

// Get calorie balance analysis
router.get('/calorie-balance', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysBack = parseInt(days);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const logs = await HealthLog.find({
      userId: req.userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const analysis = {
      averageCalorieIntake: 0,
      averageCaloriesBurned: 0,
      averageCalorieBalance: 0,
      dailyBalances: [],
      totalExerciseMinutes: 0,
      exerciseFrequency: 0,
      recommendation: ''
    };

    if (logs.length > 0) {
      let totalIntake = 0, totalBurned = 0, totalBalance = 0, totalExerciseMinutes = 0;
      let daysWithExercise = 0;

      logs.forEach(log => {
        const intake = log.diet?.totalCalories || 0;
        const burned = (log.steps?.caloriesBurned || 0);
        const balance = intake - burned;

        totalIntake += intake;
        totalBurned += burned;
        totalBalance += balance;
        totalExerciseMinutes += log.exercise?.totalDuration || 0;

        if (log.exercise?.activities?.length > 0) {
          daysWithExercise++;
        }

        analysis.dailyBalances.push({
          date: log.date,
          intake: intake,
          burned: burned,
          balance: balance
        });
      });

      analysis.averageCalorieIntake = Math.round(totalIntake / logs.length);
      analysis.averageCaloriesBurned = Math.round(totalBurned / logs.length);
      analysis.averageCalorieBalance = Math.round(totalBalance / logs.length);
      analysis.totalExerciseMinutes = totalExerciseMinutes;
      analysis.exerciseFrequency = Math.round((daysWithExercise / logs.length) * 100);

      // Generate AI recommendation
      if (analysis.averageCalorieBalance > 500) {
        analysis.recommendation = "You're consuming significantly more calories than you're burning. Consider increasing your exercise duration or reducing calorie intake for better balance.";
      } else if (analysis.averageCalorieBalance > 200) {
        analysis.recommendation = "Your calorie intake is moderately higher than what you're burning. Adding 20-30 minutes more exercise daily could help achieve better balance.";
      } else if (analysis.averageCalorieBalance < -200) {
        analysis.recommendation = "You're burning more calories than you're consuming. Make sure you're eating enough to fuel your activities and recovery.";
      } else {
        analysis.recommendation = "Great job! Your calorie intake and burn are well balanced. Keep up the good work!";
      }
    }

    res.json(analysis);
  } catch (error) {
    console.error('Calorie balance analysis error:', error);
    res.status(500).json({ message: 'Server error calculating calorie balance' });
  }
});

module.exports = router;
