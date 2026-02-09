'use client';

import { motion } from 'framer-motion';

interface ProjectCardProps {
    name: string;
    description: string;
    tags: string[];
    link?: string;
}

export default function ProjectCard({ name, description, tags, link }: ProjectCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-[#2A3F4F] border border-[#D3CCB9]/30 rounded-xl overflow-hidden shadow-xl my-2 max-w-sm"
        >
            <div className="p-4">
                <h4 className="text-[#D3CCB9] font-bold text-lg mb-1">{name}</h4>
                <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                    {description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 bg-[#1B2933] text-[#D3CCB9] border border-[#D3CCB9]/10 rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                {link && (
                    <a
                        href={link}
                        className="block text-center text-[12px] font-semibold py-2 bg-[#D3CCB9] text-[#1B2933] rounded-md hover:bg-[#898371] transition-colors"
                    >
                        Explore Project
                    </a>
                )}
            </div>
        </motion.div>
    );
}
