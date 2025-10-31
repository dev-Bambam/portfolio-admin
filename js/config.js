const CONFIG = {
    BASE_URL: 'https://fastapi-portfolio-backend.onrender.com/api/v1',
    ENDPOINTS: {
        // Auth endpoints
        LOGIN: '/admin/token',
        ME: '/admin/me',
        
        // Admin endpoints
        PROFILE: '/admin/profile/',
        SKILLS: '/admin/skills/',
        PROJECTS: '/admin/projects/',
    },
    STORAGE_KEYS: {
        TOKEN: 'portfolio_admin_token',
    },
    SKILL_LEVELS: ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'],
};