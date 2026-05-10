import { User } from '../models/User.js';

export function createUser(data) {
  return User.create(data);
}

export function findUserById(id, options = {}) {
  const query = User.findById(id);

  if (options.withPassword) {
    query.select('+passwordHash');
  }

  return query;
}

export function findUserByEmail(correo, options = {}) {
  const query = User.findOne({ correo });

  if (options.withPassword) {
    query.select('+passwordHash');
  }

  return query;
}

export function listUsers({ filters, skip, limit }) {
  return User.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit);
}

export function listCandidateEvaluadores(excludedIds, limit) {
  return User.find({
    _id: { $nin: excludedIds },
    activo: true,
    rol: { $in: ['alumno', 'evaluador'] }
  })
    .sort({ createdAt: 1 })
    .limit(limit);
}

export function countUsers(filters) {
  return User.countDocuments(filters);
}

export function updateUserById(id, data) {
  if (data.passwordHash !== undefined) {
    return User.findById(id).then(async (user) => {
      if (!user) {
        return null;
      }

      Object.assign(user, data);
      return user.save();
    });
  }

  return User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

export function deleteUserById(id) {
  return User.findByIdAndDelete(id);
}

export function deactivateUserById(id) {
  return User.findByIdAndUpdate(
    id,
    { activo: false },
    {
      new: true,
      runValidators: true
    }
  );
}
