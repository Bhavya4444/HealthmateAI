const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['walking', 'running', 'cycling', 'swimming', 'weightlifting', 'yoga', 'pilates', 'dancing', 'hiking', 'basketball', 'soccer', 'tennis', 'other']
  },
  name: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'moderate'
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  notes: String,
  time: {
    type: Date,
    default: Date.now
  }
});

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    default: 0,
    min: 0
  },
  time: {
    type: Date,
    default: Date.now
  }
});

const healthLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  steps: {
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    goal: {
      type: Number,
      default: 10000,
      min: 0
    },
    caloriesBurned: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  sleep: {
    duration: {
      type: Number, // in hours
      min: 0,
      max: 24
    },
    quality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'fair'
    },
    bedtime: Date,
    wakeTime: Date
  },
  diet: {
    meals: [mealSchema],
    waterIntake: {
      type: Number, // in glasses
      default: 0,
      min: 0
    },
    totalCalories: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  exercise: {
    activities: [exerciseSchema],
    totalDuration: {
      type: Number, // total minutes exercised
      default: 0,
      min: 0
    },
    totalCaloriesBurned: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  mood: {
    type: String,
    enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy']
  },
  energy: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  weight: {
    type: Number,
    min: 0
  },
  notes: String,
  calorieBalance: {
    type: Number, // totalCalories - totalCaloriesBurned
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate calorie burns and balances
healthLogSchema.pre('save', function(next) {
  // Calculate steps calories burned (rough estimate: 0.04 calories per step)
  if (this.steps && this.steps.count) {
    this.steps.caloriesBurned = Math.round(this.steps.count * 0.04);
  }

  // Calculate total exercise duration and calories burned
  if (this.exercise && this.exercise.activities) {
    this.exercise.totalDuration = this.exercise.activities.reduce((total, activity) => {
      return total + (activity.duration || 0);
    }, 0);

    this.exercise.totalCaloriesBurned = this.exercise.activities.reduce((total, activity) => {
      return total + (activity.caloriesBurned || 0);
    }, 0);
  }

  // Calculate total calories from meals
  if (this.diet && this.diet.meals) {
    this.diet.totalCalories = this.diet.meals.reduce((total, meal) => {
      return total + (meal.calories || 0);
    }, 0);
  }

  // Calculate calorie balance (intake - burned)
  const totalIntake = this.diet?.totalCalories || 0;
  const totalBurned = (this.steps?.caloriesBurned || 0) + (this.exercise?.totalCaloriesBurned || 0);
  this.calorieBalance = totalIntake - totalBurned;

  next();
});

// Static method to calculate calories burned for different exercises
healthLogSchema.statics.calculateCaloriesBurned = function(exerciseType, duration, intensity = 'moderate', weight = 70) {
  // Calories burned per minute for a 70kg person (adjust based on weight)
  const caloriesPerMinute = {
    walking: { low: 3, moderate: 4, high: 5 },
    running: { low: 8, moderate: 12, high: 16 },
    cycling: { low: 4, moderate: 8, high: 12 },
    swimming: { low: 6, moderate: 10, high: 14 },
    weightlifting: { low: 3, moderate: 5, high: 7 },
    yoga: { low: 2, moderate: 3, high: 4 },
    pilates: { low: 3, moderate: 4, high: 5 },
    dancing: { low: 3, moderate: 5, high: 7 },
    hiking: { low: 4, moderate: 6, high: 8 },
    basketball: { low: 6, moderate: 8, high: 10 },
    soccer: { low: 6, moderate: 9, high: 12 },
    tennis: { low: 5, moderate: 7, high: 9 },
    other: { low: 3, moderate: 5, high: 7 }
  };

  const baseCalories = caloriesPerMinute[exerciseType]?.[intensity] || caloriesPerMinute.other[intensity];
  const weightMultiplier = weight / 70; // Adjust for user's weight

  return Math.round(baseCalories * duration * weightMultiplier);
};

// Index for efficient querying
healthLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HealthLog', healthLogSchema);
