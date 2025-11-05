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
  bodyComposition: {
    bodyFatPercentage: {
      type: Number,
      min: 3,
      max: 50,
      validate: {
        validator: function(v) {
          return v == null || (v >= 3 && v <= 50);
        },
        message: 'Body fat percentage should be between 3-50%'
      }
    },
    muscleMass: {
      type: Number,
      min: 10,
      max: 200,
      validate: {
        validator: function(v) {
          return v == null || (v >= 10 && v <= 200);
        },
        message: 'Muscle mass should be between 10-200 kg'
      }
    },
    boneDensity: {
      type: Number,
      min: 0.5,
      max: 2.0,
      validate: {
        validator: function(v) {
          return v == null || (v >= 0.5 && v <= 2.0);
        },
        message: 'Bone density should be between 0.5-2.0 g/cm²'
      }
    },
    bmi: {
      type: Number,
      min: 10,
      max: 50
    },
    fitnessLevel: {
      type: String,
      enum: ['poor', 'fair', 'average', 'good', 'excellent'],
      default: 'average'
    },
    measurementTime: {
      type: Date,
      default: Date.now
    },
    notes: String
  },
  bloodPressure: {
    systolic: {
      type: Number,
      min: 70,
      max: 250,
      validate: {
        validator: function(v) {
          return v == null || (v >= 70 && v <= 250);
        },
        message: 'Systolic pressure should be between 70-250 mmHg'
      }
    },
    diastolic: {
      type: Number,
      min: 40,
      max: 150,
      validate: {
        validator: function(v) {
          return v == null || (v >= 40 && v <= 150);
        },
        message: 'Diastolic pressure should be between 40-150 mmHg'
      }
    },
    pulse: {
      type: Number,
      min: 30,
      max: 200
    },
    category: {
      type: String,
      enum: ['optimal', 'normal', 'high_normal', 'grade1_hypertension', 'grade2_hypertension', 'grade3_hypertension', 'isolated_systolic'],
      default: 'normal'
    },
    measurementTime: {
      type: Date,
      default: Date.now
    },
    notes: String
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

  // Calculate BMI and fitness level from body composition if we have user data
  if (this.bodyComposition && this.populated('userId') && this.userId.height && this.weight) {
    const heightInMeters = this.userId.height / 100;
    this.bodyComposition.bmi = this.weight / (heightInMeters * heightInMeters);
    
    // Calculate fitness level based on body composition
    if (this.bodyComposition.bodyFatPercentage && this.bodyComposition.muscleMass) {
      this.bodyComposition.fitnessLevel = this.constructor.calculateFitnessLevel(
        this.bodyComposition.bodyFatPercentage,
        this.bodyComposition.muscleMass,
        this.userId.gender,
        this.userId.age
      );
    }
  }

  // Categorize blood pressure reading
  if (this.bloodPressure && this.bloodPressure.systolic && this.bloodPressure.diastolic) {
    this.bloodPressure.category = this.constructor.categorizeBloodPressure(
      this.bloodPressure.systolic, 
      this.bloodPressure.diastolic
    );
  }

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

// Static method to calculate fitness level based on body composition
healthLogSchema.statics.calculateFitnessLevel = function(bodyFatPercentage, muscleMass, gender, age) {
  let score = 0;
  
  // Body fat scoring (gender and age specific)
  if (gender === 'male') {
    if (age < 30) {
      score += bodyFatPercentage < 14 ? 5 : bodyFatPercentage < 18 ? 4 : bodyFatPercentage < 25 ? 3 : 2;
    } else if (age < 50) {
      score += bodyFatPercentage < 17 ? 5 : bodyFatPercentage < 21 ? 4 : bodyFatPercentage < 28 ? 3 : 2;
    } else {
      score += bodyFatPercentage < 20 ? 5 : bodyFatPercentage < 25 ? 4 : bodyFatPercentage < 30 ? 3 : 2;
    }
  } else {
    if (age < 30) {
      score += bodyFatPercentage < 21 ? 5 : bodyFatPercentage < 25 ? 4 : bodyFatPercentage < 32 ? 3 : 2;
    } else if (age < 50) {
      score += bodyFatPercentage < 24 ? 5 : bodyFatPercentage < 28 ? 4 : bodyFatPercentage < 35 ? 3 : 2;
    } else {
      score += bodyFatPercentage < 27 ? 5 : bodyFatPercentage < 31 ? 4 : bodyFatPercentage < 38 ? 3 : 2;
    }
  }
  
  // Muscle mass scoring (relative to body weight approximation)
  const avgMuscleMass = gender === 'male' ? 35 : 28;
  score += muscleMass > avgMuscleMass * 1.2 ? 5 : 
           muscleMass > avgMuscleMass ? 4 : 
           muscleMass > avgMuscleMass * 0.8 ? 3 : 2;
  
  // Convert to fitness level
  const totalScore = score / 2; // Average of both metrics
  if (totalScore >= 4.5) return 'excellent';
  if (totalScore >= 3.5) return 'good';
  if (totalScore >= 2.5) return 'average';
  if (totalScore >= 1.5) return 'fair';
  return 'poor';
};

// Static method to categorize blood pressure readings
healthLogSchema.statics.categorizeBloodPressure = function(systolic, diastolic) {
  if (!systolic || !diastolic) return 'normal';
  
  // Based on ESC/ESH Guidelines
  if (systolic < 120 && diastolic < 80) {
    return 'optimal';
  } else if (systolic < 130 && diastolic < 85) {
    return 'normal';
  } else if (systolic < 140 && diastolic < 90) {
    return 'high_normal';
  } else if (systolic < 160 && diastolic < 100) {
    return 'grade1_hypertension';
  } else if (systolic < 180 && diastolic < 110) {
    return 'grade2_hypertension';
  } else if (systolic >= 180 || diastolic >= 110) {
    return 'grade3_hypertension';
  } else if (systolic >= 140 && diastolic < 90) {
    return 'isolated_systolic';
  }
  
  return 'normal';
};

// Method to get blood pressure interpretation
healthLogSchema.statics.getBloodPressureInterpretation = function(category) {
  const interpretations = {
    optimal: { label: 'Optimal', color: 'green', description: 'Excellent blood pressure' },
    normal: { label: 'Normal', color: 'green', description: 'Good blood pressure' },
    high_normal: { label: 'High Normal', color: 'yellow', description: 'Monitor regularly' },
    grade1_hypertension: { label: 'Grade 1 Hypertension', color: 'orange', description: 'Consult healthcare provider' },
    grade2_hypertension: { label: 'Grade 2 Hypertension', color: 'red', description: 'Requires medical attention' },
    grade3_hypertension: { label: 'Grade 3 Hypertension', color: 'red', description: 'Seek immediate medical care' },
    isolated_systolic: { label: 'Isolated Systolic Hypertension', color: 'orange', description: 'Consult healthcare provider' }
  };
  
  return interpretations[category] || interpretations.normal;
};

// Index for efficient querying
healthLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HealthLog', healthLogSchema);
