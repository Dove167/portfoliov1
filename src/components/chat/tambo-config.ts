import { z } from 'zod';
import { defineTool } from '@tambo-ai/react';
import ProjectCard from './ProjectCard';
import EducationCard from './EducationCard';
import SkillGrid from './SkillGrid';

export const tamboComponents = [
    {
        name: 'ProjectCard',
        component: ProjectCard,
        description: 'Displays a project with name, description, and link.',
        propsSchema: z.object({
            name: z.string(),
            description: z.string(),
            tags: z.array(z.string()),
            link: z.string().optional(),
        }),
    },
    {
        name: 'EducationCard',
        component: EducationCard,
        description: 'Displays educational background or specific school details.',
        propsSchema: z.object({
            school: z.string(),
            degree: z.string(),
            period: z.string(),
            highlights: z.array(z.string()),
        }),
    },
    {
        name: 'SkillGrid',
        component: SkillGrid,
        description: 'Displays a grid of technical skills for a specific category.',
        propsSchema: z.object({
            category: z.string(),
            skills: z.array(z.string()),
        }),
    },
];

export const tamboTools = [
    defineTool({
        name: 'search_josh_data',
        description: 'Search for specific facts about Josh\'s background, skills, and projects from the Rust Knowledge Service.',
        inputSchema: z.object({
            query: z.string().describe('The search terms to look for.'),
        }),
        outputSchema: z.any(),
        tool: async ({ query }: { query: string }) => {
            try {
                const response = await fetch(`/api/knowledge/search?q=${encodeURIComponent(query)}`);
                return await response.json();
            } catch (error) {
                return { error: 'Failed to search knowledge service' };
            }
        },
    }),
];
