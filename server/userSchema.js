const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const questSchema = new mongoose.Schema({
    questId: {
      type: String,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    lastClaim: {
      type: Date,
      default: Date.now
    }
  });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  completedQuests: [{
    questId: String,
    completedAt: Date,
    lastClaim: Date
  }],
  dailyLoginStreak: {
    type: Number,
    default: 0,
  },
  walletAddress: {
    type: String,
    default: null,
  },
  nfts: [{
    tokenId: String,
    contractAddress: String,
    metadata: mongoose.Schema.Types.Mixed,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = Date.now();
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update daily login streak
userSchema.methods.updateLoginStreak = async function() {
  const now = new Date();
  const lastLogin = this.lastLogin;
  
  if (!lastLogin) {
    this.dailyLoginStreak = 1;
  } else {
    const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      this.dailyLoginStreak += 1;
    } else if (diffDays > 1) {
      this.dailyLoginStreak = 1;
    }
  }
  
  this.lastLogin = now;
  await this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;