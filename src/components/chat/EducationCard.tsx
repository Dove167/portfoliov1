'use client';

import { motion } from 'framer-motion';

interface EducationCardProps {
    school: string;
    degree: string;
    period: string;
    highlights: string[];
}

export default function EducationCard({ school, degree, period, highlights }: EducationCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#2A3F4F] border-l-4 border-[#D3CCB9] p-4 rounded-r-xl shadow-lg my-2 max-w-sm"
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="text-[#D3CCB9] font-bold text-lg">{school}</h4>
                    <p className="text-white text-sm font-semibold">{degree}</p>
                </div>
                <span className="text-[10px] text-[#D3CCB9]/70 bg-[#1B2933] px-2 py-1 rounded-md">
                    {period}
                </span>
            </div>
            <ul className="space-y-1.5 mt-3">
                {highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="text-[#D3CCB9] mt-1">•</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}
