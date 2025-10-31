class ApiService {
    static async handleResponse(response) {
        console.log('API Response:', {
            url: response.url,
            status: response.status,
            statusText: response.statusText
        });

        if (!response.ok) {
            try {
                const error = await response.json();
                console.error('API Error:', error);
                throw new Error(error.err_msg || error.detail || `API request failed: ${response.statusText}`);
            } catch (e) {
                if (e instanceof SyntaxError) {
                    throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
                }
                throw e;
            }
        }

        if (response.status === 204) {
            return null;
        }

        const data = await response.json();
        console.log('API Success:', data);
        return data;
    }

    // Profile Management
    static async getProfile() {
        console.log('Fetching profile from:', `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.PROFILE}`);
        const headers = AuthService.getAuthHeaders();
        console.log('Auth headers:', headers);
        
        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.PROFILE}`, {
            headers: {
                ...headers,
                'Accept': 'application/json'
            }
        });
        return this.handleResponse(response);
    }

    static async createProfile(profileData) {
        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.PROFILE}`, {
            method: 'POST',
            headers: AuthService.getAuthHeaders(),
            body: JSON.stringify(profileData)
        });
        return this.handleResponse(response);
    }

    static async updateProfile(profileData) {
        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.PROFILE}`, {
            method: 'PUT',
            headers: AuthService.getAuthHeaders(),
            body: JSON.stringify(profileData)
        });
        return this.handleResponse(response);
    }

    // Skills Management
    static async getSkills() {
        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.SKILLS}`, {
            headers: AuthService.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    static async createSkill(skillData) {
        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.SKILLS}`, {
            method: 'POST',
            headers: AuthService.getAuthHeaders(),
            body: JSON.stringify(skillData)
        });
        return this.handleResponse(response);
    }

    static async updateSkill(id, skillData) {
        if (!id) throw new Error('Skill ID is required');
        
        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.SKILLS}${id}`, {
            method: 'PUT',
            headers: {
                ...AuthService.getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: skillData.name,
                level: parseInt(skillData.level),
                category: skillData.category || null
            })
        });
        return this.handleResponse(response);
    }

    static async deleteSkill(id) {
        if (!id) throw new Error('Skill ID is required');
        
        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.SKILLS}${id}`, {
            method: 'DELETE',
            headers: AuthService.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    // Projects Management
    static async getProjects() {
        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.PROJECTS}`, {
            headers: AuthService.getAuthHeaders()
        });
        return this.handleResponse(response);
    }
    static async createProject(projectData) {
        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.PROJECTS}`, {
            method: 'POST',
            headers: AuthService.getAuthHeaders(),
            body: JSON.stringify(projectData)
        });
        return this.handleResponse(response);
    }

    static async updateProject(id, projectData) {
        if (!id) throw new Error('Project ID is required');

        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.PROJECTS}${id}`, {
            method: 'PUT',
            headers: {
                ...AuthService.getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: projectData.title,
                description: projectData.description,
                status: projectData.status,
                github_url: projectData.github_url,
                docs_url: projectData.docs_url,
                live_url: projectData.live_url || null,
                tech_stack: projectData.tech_stack ? 
                    projectData.tech_stack.split(',').map(tech => tech.trim()) : 
                    []
            })
        });
        return this.handleResponse(response);
    }

    static async deleteProject(id) {
        if (!id) throw new Error('Project ID is required');

        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.PROJECTS}${id}`, {
            method: 'DELETE',
            headers: AuthService.getAuthHeaders()
        });
        return this.handleResponse(response);
    }
}