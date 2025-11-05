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
      bodyComposition,
      bloodPressure,
      notes
    } = req.body;

    console.log('📊 Received health log data:', {
      bodyComposition,
      bloodPressure,
      hasBodyComposition: !!bodyComposition,
      hasBloodPressure: !!bloodPressure
    });

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
    if (bodyComposition) {
      console.log('💪 Received bodyComposition data:', bodyComposition);
      // Ensure we preserve existing fields but update with new values
      if (!log.bodyComposition) log.bodyComposition = {};
      if (bodyComposition.bodyFatPercentage !== undefined) log.bodyComposition.bodyFatPercentage = typeof bodyComposition.bodyFatPercentage === 'number' ? bodyComposition.bodyFatPercentage : parseFloat(bodyComposition.bodyFatPercentage) || undefined;
      if (bodyComposition.muscleMass !== undefined) log.bodyComposition.muscleMass = typeof bodyComposition.muscleMass === 'number' ? bodyComposition.muscleMass : parseFloat(bodyComposition.muscleMass) || undefined;
      if (bodyComposition.boneDensity !== undefined) log.bodyComposition.boneDensity = typeof bodyComposition.boneDensity === 'number' ? bodyComposition.boneDensity : parseFloat(bodyComposition.boneDensity) || undefined;
      // Preserve calculated fields
      if (bodyComposition.bmi) log.bodyComposition.bmi = bodyComposition.bmi;
      if (bodyComposition.fitnessLevel) log.bodyComposition.fitnessLevel = bodyComposition.fitnessLevel;
      if (bodyComposition.notes) log.bodyComposition.notes = bodyComposition.notes;
      log.bodyComposition.measurementTime = new Date();
      log.markModified('bodyComposition');
      console.log('💪 Updated log.bodyComposition:', log.bodyComposition);
    }
    if (bloodPressure) {
      console.log('🩺 Received bloodPressure data:', bloodPressure);
      log.bloodPressure = { ...log.bloodPressure, ...bloodPressure };
      log.markModified('bloodPressure');
      console.log('🩺 Updated log.bloodPressure:', log.bloodPressure);
    }
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
      totalWorkouts: 0,
      // Added body composition analytics
      bodyFatTrend: [],
      muscleMassTrend: [],
      boneDensityTrend: [],
      averageBodyFat: 0,
      averageMuscleMass: 0,
      averageBoneDensity: 0,
      fitnessLevelCounts: {},
      bloodPressureSystolicTrend: [],
      bloodPressureDiastolicTrend: [],
      averageSystolicBP: 0,
      averageDiastolicBP: 0,
      bpCategoryCounts: {}
    };

    if (logs.length > 0) {
      let totalSteps = 0, totalSleep = 0, totalCalories = 0, totalEnergy = 0;
      let totalBodyFat = 0, bodyFatCount = 0, totalMuscleMass = 0, muscleMassCount = 0;
      let totalBoneDensity = 0, boneDensityCount = 0;
      let totalSystolic = 0, systolicCount = 0, totalDiastolic = 0, diastolicCount = 0;

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

        if (log.bodyComposition) {
          if (typeof log.bodyComposition.bodyFatPercentage === 'number') {
            analytics.bodyFatTrend.push({ date: log.date, value: log.bodyComposition.bodyFatPercentage });
            totalBodyFat += log.bodyComposition.bodyFatPercentage; bodyFatCount++;
          }
          if (typeof log.bodyComposition.muscleMass === 'number') {
            analytics.muscleMassTrend.push({ date: log.date, value: log.bodyComposition.muscleMass });
            totalMuscleMass += log.bodyComposition.muscleMass; muscleMassCount++;
          }
          if (typeof log.bodyComposition.boneDensity === 'number') {
            analytics.boneDensityTrend.push({ date: log.date, value: log.bodyComposition.boneDensity });
            totalBoneDensity += log.bodyComposition.boneDensity; boneDensityCount++;
          }
          if (log.bodyComposition.fitnessLevel) {
            analytics.fitnessLevelCounts[log.bodyComposition.fitnessLevel] = (analytics.fitnessLevelCounts[log.bodyComposition.fitnessLevel] || 0) + 1;
          }
        }
        if (log.bloodPressure) {
          if (typeof log.bloodPressure.systolic === 'number') {
            analytics.bloodPressureSystolicTrend.push({ date: log.date, value: log.bloodPressure.systolic });
            totalSystolic += log.bloodPressure.systolic; systolicCount++;
          }
          if (typeof log.bloodPressure.diastolic === 'number') {
            analytics.bloodPressureDiastolicTrend.push({ date: log.date, value: log.bloodPressure.diastolic });
            totalDiastolic += log.bloodPressure.diastolic; diastolicCount++;
          }
          if (log.bloodPressure.category) {
            analytics.bpCategoryCounts[log.bloodPressure.category] = (analytics.bpCategoryCounts[log.bloodPressure.category] || 0) + 1;
          }
        }
      });

      analytics.averageSteps = Math.round(totalSteps / logs.length);
      analytics.averageSleep = Math.round((totalSleep / logs.length) * 10) / 10;
      analytics.averageCalories = Math.round(totalCalories / logs.length);
      analytics.averageEnergy = Math.round((totalEnergy / logs.length) * 10) / 10;
      analytics.averageBodyFat = bodyFatCount ? Math.round((totalBodyFat / bodyFatCount) * 10) / 10 : 0;
      analytics.averageMuscleMass = muscleMassCount ? Math.round((totalMuscleMass / muscleMassCount) * 10) / 10 : 0;
      analytics.averageBoneDensity = boneDensityCount ? Math.round((totalBoneDensity / boneDensityCount) * 100) / 100 : 0;
      analytics.averageSystolicBP = systolicCount ? Math.round(totalSystolic / systolicCount) : 0;
      analytics.averageDiastolicBP = diastolicCount ? Math.round(totalDiastolic / diastolicCount) : 0;
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
