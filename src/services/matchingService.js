const { db } = require('../config/firebaseAdmin');

function getDistanceKm(from, to) {
  if (!from || !to || typeof from.lat !== 'number' || typeof from.lng !== 'number' || typeof to.lat !== 'number' || typeof to.lng !== 'number') {
    return null;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function overlapScore(requiredSkills = [], volunteerSkills = []) {
  if (!requiredSkills.length) {
    return 1;
  }

  const matches = requiredSkills.filter((skill) => volunteerSkills.includes(skill)).length;
  return matches / requiredSkills.length;
}

function availabilityScore(volunteer = {}, task = {}) {
  const days = volunteer.availability?.days || [];
  const day = task.day || null;

  if (!day) {
    return 0.7;
  }

  return days.includes(day) ? 1 : 0;
}

async function matchVolunteersForTask(task) {
  const volunteersSnapshot = await db.collection('users')
    .where('role', '==', 'volunteer')
    .where('active', '==', true)
    .get();

  const taskLocation = task.location || {};
  const results = [];

  volunteersSnapshot.forEach((doc) => {
    const volunteer = doc.data();
    const skillScore = overlapScore(task.requiredSkills || [], volunteer.skills || []);

    const distanceKm = getDistanceKm(volunteer.location, taskLocation);
    const radiusKm = volunteer.preferredRadiusKm || 10;
    const distanceScore = distanceKm === null ? 0.5 : Math.max(0, 1 - (distanceKm / radiusKm));
    if (distanceKm !== null && distanceKm > radiusKm) {
      return;
    }

    const availScore = availabilityScore(volunteer, task);
    const languageMatch = task.languagesNeeded?.length
      ? task.languagesNeeded.some((language) => (volunteer.languages || []).includes(language))
      : true;
    const languageScore = languageMatch ? 1 : 0.5;

    const finalScore = Math.round((skillScore * 0.5 + distanceScore * 0.25 + availScore * 0.2 + languageScore * 0.05) * 100);

    results.push({
      volunteerId: doc.id,
      name: volunteer.name,
      email: volunteer.email,
      matchScore: finalScore,
      reasons: [
        `${Math.round(skillScore * 100)}% skill match`,
        distanceKm === null ? 'Distance not available' : `Within ${distanceKm.toFixed(1)} km`,
        availScore > 0 ? 'Availability match' : 'Limited availability',
        languageMatch ? 'Language fit' : 'Partial language fit'
      ]
    });
  });

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
}

module.exports = {
  matchVolunteersForTask
};
