'use client';

import { motion } from 'framer-motion';

interface SkillGridProps {
    category: string;
    skills: string[];
}

export default function SkillGrid({ category, skills }: SkillGridProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1B2933] border border-[#D3CCB9]/30 p-4 rounded-xl shadow-xl my-2 max-w-sm"
        >
            <h4 className="text-[#D3CCB9] font-bold text-sm uppercase tracking-wider mb-3">
                {category}
            </h4>
            <div className="grid grid-cols-2 gap-2">
                {skills.map((skill, i) => (
                    <motion.div
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2 bg-[#2A3F4F] px-3 py-2 rounded-lg border border-white/5"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D3CCB9]" />
                        <span className="text-xs text-white font-medium">{skill}</span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
