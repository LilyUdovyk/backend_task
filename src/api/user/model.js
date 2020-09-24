import crypto from 'crypto'
import bcrypt from 'bcrypt'
import randtoken from 'rand-token'
import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import { env } from '../../config'
import userRoles, { passenger } from './user-roles'

const userSchema = new Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  login: {
    type: String,
    index: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  services: {
    facebook: String,
    github: String,
    google: String
  },
  role: {
    type: String,
    enum: userRoles,
    default: passenger
  },
  picture: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  flights: {
    type:   [{
      type: mongoose.Schema.Types.ObjectId,
      ref:'Flight'
    }],
    default: []
  }

}, {
  timestamps: true
})

userSchema.virtual('fullName')
    .get(function () {
        return this.firstName + ' ' + this.lastName;
    })
    .set(function(v) {
        this.firstName = v.substr(0, v.indexOf(' '));
        this.lastName = v.substr(v.indexOf(' ') + 1);
    });

userSchema.path('email').set(function (email) {
  if (!this.picture || this.picture.indexOf('https://gravatar.com') === 0) {
    const hash = crypto.createHash('md5').update(email).digest('hex')
    this.picture = `https://gravatar.com/avatar/${hash}?d=identicon`
  }

  if (!this.login) {
    this.login = email.replace(/^(.+)@.+$/, '$1')
  }

  return email
})

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()

  /* istanbul ignore next */
  const rounds = env === 'test' ? 1 : 9

  bcrypt.hash(this.password, rounds).then((hash) => {
    this.password = hash
    next()
  }).catch(next)
})

userSchema.methods = {
  view (full) {
    const view = {}
    let fields = ['fullName', 'picture', 'country']

    if (full) {
      fields = [...fields, 'id', 'login', 'email', 'role', 'createdAt', 'flights']
    }

    fields.forEach((field) => { view[field] = this[field] })

    return view
  },

  authenticate (password) {
    return bcrypt.compare(password, this.password).then((valid) => valid ? this : false)
  }

}

userSchema.statics = {
  userRoles,

  createFromService ({ service, id, email, login, fullName, picture, country, flights }) {
    return this.findOne({ $or: [{ [`services.${service}`]: id }, { email }] }).then((user) => {
      if (user) {
        user.services[service] = id
        user.login = login
        user.fullName = fullName
        user.picture = picture
        user.country = country
        user.flights = flights
        return user.save()
      } else {
        const password = randtoken.generate(16)
        return this.create({ services: { [service]: id }, email, password, login, fullName, picture, country, flights })
      }
    })
  }
}

userSchema.plugin(mongooseKeywords, { paths: ['email', 'login'] })

const model = mongoose.model('User', userSchema)

export const schema = model.schema
export default model
