export const calculateSkillOverlap = (userA, userB) => {
    const a_teaches_b = [];
    const b_teaches_a = [];

    userA.skills_teach.forEach(teachSkill => {
        const learnSkill = userB.skills_learn.find(s => s.skill.toLowerCase() === teachSkill.skill.toLowerCase());
        if (learnSkill) {
            a_teaches_b.push({ skill: teachSkill.skill, level: teachSkill.level });
        }
    });

    userB.skills_teach.forEach(teachSkill => {
        const learnSkill = userA.skills_learn.find(s => s.skill.toLowerCase() === teachSkill.skill.toLowerCase());
        if (learnSkill) {
            b_teaches_a.push({ skill: teachSkill.skill, level: teachSkill.level });
        }
    });

    return {
        valid: a_teaches_b.length > 0 || b_teaches_a.length > 0,
        a_teaches_b,
        b_teaches_a
    };
};

export const calculateLevelCompatibility = (teacherLevel, learnerLevel) => {
    const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    const tLevel = levels[teacherLevel] || 2;
    const lLevel = levels[learnerLevel] || 1;
    const diff = tLevel - lLevel;
    
    if (diff >= 2) return 100;
    if (diff === 1) return 80;
    if (diff === 0) return 60;
    return 30; // Teacher is lower level
};

export const calculateAvailabilityOverlap = (availA, availB) => {
    let overlappingHours = 0;

    availA.forEach(slotA => {
        const slotB = availB.find(b => b.day === slotA.day);
        if (slotB) {
            const startA = parseInt(slotA.start.split(':')[0]);
            const endA = parseInt(slotA.end.split(':')[0]);
            const startB = parseInt(slotB.start.split(':')[0]);
            const endB = parseInt(slotB.end.split(':')[0]);

            const overlapStart = Math.max(startA, startB);
            const overlapEnd = Math.min(endA, endB);

            if (overlapStart < overlapEnd) {
                overlappingHours += (overlapEnd - overlapStart);
            }
        }
    });

    return overlappingHours;
};

export const computeCompatibilityScore = (userA, userB) => {
    const overlap = calculateSkillOverlap(userA, userB);
    if (!overlap.valid) return { score: 0, breakdown: null, best_pair: null };

    let skillScore = 0;
    let levelScore = 0;
    let bestPair = null;

    if (overlap.a_teaches_b.length > 0 && overlap.b_teaches_a.length > 0) {
        skillScore = 100; // Mutual exchange
        const t1 = overlap.a_teaches_b[0];
        const t2 = overlap.b_teaches_a[0];
        levelScore = (calculateLevelCompatibility(t1.level, 'beginner') + calculateLevelCompatibility(t2.level, 'beginner')) / 2;
        bestPair = { user_a_teaches: t1.skill, user_b_teaches: t2.skill };
    } else if (overlap.a_teaches_b.length > 0) {
        skillScore = 50; // One way
        const t1 = overlap.a_teaches_b[0];
        levelScore = calculateLevelCompatibility(t1.level, 'beginner');
        bestPair = { user_a_teaches: t1.skill, user_b_teaches: null };
    } else {
        skillScore = 50; // One way
        const t2 = overlap.b_teaches_a[0];
        levelScore = calculateLevelCompatibility(t2.level, 'beginner');
        bestPair = { user_a_teaches: null, user_b_teaches: t2.skill };
    }

    const availOverlap = calculateAvailabilityOverlap(userA.availability || [], userB.availability || []);
    const availScore = Math.min(availOverlap * 20, 100);

    const repA = userA.reputation ? userA.reputation.score : 50;
    const repB = userB.reputation ? userB.reputation.score : 50;
    const repScore = Math.min(Math.max((repA + repB) / 2, 0), 100);

    const finalScore = Math.min(Math.round((skillScore * 0.4) + (levelScore * 0.3) + (availScore * 0.2) + (repScore * 0.1)), 100);

    return {
        score: Math.max(finalScore, 50),
        breakdown: {
            skill_overlap: Math.round(skillScore),
            level_compat: Math.round(levelScore),
            availability_overlap: Math.round(availScore),
            reputation_factor: Math.round(repScore)
        },
        best_pair: bestPair
    };
};
