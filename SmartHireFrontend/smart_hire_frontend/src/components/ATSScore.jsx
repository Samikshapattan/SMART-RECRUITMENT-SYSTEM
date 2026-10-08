import React from "react";

/**
 * computeATSScore(profile)
 * - profile: candidateProfile object from backend
 * Heuristic (weights):
 *  - name/email/phone presence: 10%
 *  - skills count: 30%
 *  - education presence: 20%
 *  - experience presence: 30%
 *  - rawText length: 10%
 */
export function computeATSScore(profile = {}) {
  let score = 0;
  const breakdown = {};

  // Basics
  const basics = (profile.fullName ? 1 : 0) + (profile.email ? 1 : 0) + (profile.phone ? 1 : 0);
  const basicsPct = Math.min(1, basics / 3);
  breakdown.basics = Math.round(basicsPct * 100);
  score += basicsPct * 10; // 10%

  // Skills (max 30)
  const skills = Array.isArray(profile.skills) ? profile.skills.filter(Boolean) : [];
  const skillsPct = Math.min(1, skills.length / 8); // 8 skills -> full
  breakdown.skills = Math.round(skillsPct * 100);
  score += skillsPct * 30;

  // Education (20)
  const education = Array.isArray(profile.education) ? profile.education : [];
  const eduPct = education.length > 0 ? 1 : 0;
  breakdown.education = eduPct * 100;
  score += eduPct * 20;

  // Experience (30)
  const exp = Array.isArray(profile.experience) ? profile.experience : [];
  const expScore = Math.min(1, exp.length / 3); // 3 entries -> full
  breakdown.experience = Math.round(expScore * 100);
  score += expScore * 30;

  // Raw text length
  const rawLen = (profile.rawText || "").length;
  const rawPct = Math.min(1, rawLen / 3000); // 3000 chars -> full
  breakdown.rawText = Math.round(rawPct * 100);
  score += rawPct * 10;

  const final = Math.round(score); // 0-100
  return { score: final, breakdown };
}

export default function ATSScore({ profile }) {
  const { score, breakdown } = computeATSScore(profile);

  const color =
    score >= 80 ? "bg-green-500" :
    score >= 60 ? "bg-yellow-400" :
    "bg-red-500";

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">ATS Score</h3>
          <div className="text-sm text-gray-500">Estimated match / completeness</div>
        </div>
        <div className="text-2xl font-bold">{score}%</div>
      </div>

      <div className="mt-3">
        <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
          <div className={`${color} h-3 rounded`} style={{ width: `${score}%` }} />
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-600 space-y-1">
        <div>Basics: {breakdown.basics}%</div>
        <div>Skills: {breakdown.skills}%</div>
        <div>Education: {breakdown.education}%</div>
        <div>Experience: {breakdown.experience}%</div>
        <div>Text Coverage: {breakdown.rawText}%</div>
      </div>
    </div>
  );
}
