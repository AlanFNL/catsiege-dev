const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12

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
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
  },
  points: {
    type: Number,
    default: 0,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false
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
  },
  quests: {
    nftHolder: { type: Boolean, default: false },
    nftVerified: { type: Boolean, default: false }
  }
});



userSchema.pre('save', function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // Generate a salt and hash the password
  bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);

      // Override the cleartext password with the hashed one
      this.password = hash;
      next();
    });
  });
});

// Method to check password
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
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