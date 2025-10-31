class App {
    static async initialize() {
        this.setupEventListeners();
        this.checkAuthState();
    }

    static setupEventListeners() {
        // Auth related
        UI.elements.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        UI.elements.logoutBtn.addEventListener('click', () => AuthService.logout());

        // Navigation
        UI.elements.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.getAttribute('data-section');
                UI.switchSection(`${section}-section`);
            });
        });

        // Skills Grid Event Delegation
        UI.elements.skillsGrid.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');
            
            if (!id) {
                console.error('No skill ID found');
                return;
            }

            console.log(`${action} skill:`, id); // Debug log
            
            if (action === 'edit') {
                this.editSkill(id);
            } else if (action === 'delete') {
                this.deleteSkill(id);
            }
        });

        // Projects Grid Event Delegation
        UI.elements.projectsGrid.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');
            
            if (!id) {
                console.error('No project ID found');
                return;
            }

            console.log(`${action} project:`, id); // Debug log
            
            if (action === 'edit') {
                this.editProject(id);
            } else if (action === 'delete') {
                this.deleteProject(id);
            }
        });

        // Profile management
        UI.elements.profileForm.addEventListener('submit', this.handleProfileSubmit.bind(this));
        UI.elements.addSocialLinkBtn.addEventListener('click', () => UI.addSocialLinkFields());

        // Skills management
        UI.elements.addSkillBtn.addEventListener('click', () => UI.showSkillModal());
        UI.elements.closeSkillModal.addEventListener('click', () => UI.hideSkillModal());
        UI.elements.skillForm.addEventListener('submit', this.handleSkillSubmit.bind(this));

        // Projects management
        UI.elements.addProjectBtn.addEventListener('click', () => UI.showProjectModal());
        UI.elements.closeProjectModal.addEventListener('click', () => UI.hideProjectModal());
        UI.elements.projectForm.addEventListener('submit', this.handleProjectSubmit.bind(this));

        // Make edit/delete skill/project methods available globally
        window.App = {
            editSkill: this.editSkill.bind(this),
            deleteSkill: this.deleteSkill.bind(this),
            editProject: this.editProject.bind(this),
            deleteProject: this.deleteProject.bind(this)
        };
    }

    static async checkAuthState() {
        const token = AuthService.getToken();
        console.log('Current auth state:', token ? 'Has token' : 'No token');

        if (!token) {
            UI.switchView(false);
            return;
        }

        try {
            await AuthService.checkAuth();
            console.log('Auth check passed');
            UI.switchView(true);
            UI.switchSection('profile-section');
            await this.loadDashboardData();
        } catch (error) {
            console.error('Auth check failed:', error);
            AuthService.removeToken(); // Clear invalid token
            UI.switchView(false);
            UI.showToast('Session expired. Please login again.', 'error');
        }
    }

    static async loadDashboardData() {
        UI.showLoading(true);
        try {
            console.log('Loading dashboard data...');
            // Load data sequentially to better identify issues
            const profile = await ApiService.getProfile();
            console.log('Profile loaded:', profile);
            
            const skills = await ApiService.getSkills();
            console.log('Skills loaded:', skills);
            
            const projects = await ApiService.getProjects();
            console.log('Projects loaded:', projects);

            UI.renderProfile(profile);
            UI.renderSkills(skills);
            UI.renderProjects(projects);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            UI.showToast('Failed to load dashboard data', 'error');
        } finally {
            UI.showLoading(false);
        }
    }

    static async handleLogin(event) {
        event.preventDefault();
        UI.showLoading(true);

        try {
            const formData = new FormData(event.target);
            await AuthService.login(formData.get('username'), formData.get('password'));
            UI.switchView(true);
            UI.switchSection('profile-section');
            this.loadDashboardData();
        } catch (error) {
            UI.showLoginError(error.message);
        } finally {
            UI.showLoading(false);
        }
    }

    static async handleProfileSubmit(event) {
        event.preventDefault();
        UI.showLoading(true);

        try {
            const formData = new FormData(event.target);
            const socialLinks = Array.from(formData.getAll('platform[]')).map((platform, index) => ({
                platform,
                url: formData.getAll('url[]')[index]
            })).filter(link => link.platform && link.url);

            const profileData = {
                full_name: formData.get('full_name'),
                nickname: formData.get('nickname'),
                professional_title: formData.get('professional_title'),
                bio: formData.get('bio'),
                email: formData.get('email'),
                contact: {
                    phone_no: formData.get('phone_no'),
                    whatsapp: formData.get('whatsapp')
                },
                social_links: socialLinks
            };

            let response;
            try {
                response = await ApiService.getProfile();
                await ApiService.updateProfile(profileData);
            } catch (error) {
                if (error.message.includes('not found')) {
                    await ApiService.createProfile(profileData);
                } else {
                    throw error;
                }
            }

            UI.showToast('Profile saved successfully');
        } catch (error) {
            console.error('Error saving profile:', error);
            UI.showToast('Failed to save profile', 'error');
        } finally {
            UI.showLoading(false);
        }
    }

    static async handleSkillSubmit(event) {
        event.preventDefault();
        UI.showLoading(true);

        try {
            const formData = new FormData(event.target);
            const skillData = {
                name: formData.get('name'),
                level: parseInt(formData.get('level')),
                category: formData.get('category') || undefined
            };

            const skillId = formData.get('id');
            if (skillId) {
                await ApiService.updateSkill(skillId, skillData);
            } else {
                await ApiService.createSkill(skillData);
            }

            UI.hideSkillModal();
            const skills = await ApiService.getSkills();
            UI.renderSkills(skills);
            UI.showToast('Skill saved successfully');
        } catch (error) {
            console.error('Error saving skill:', error);
            UI.showToast('Failed to save skill', 'error');
        } finally {
            UI.showLoading(false);
        }
    }

    static async editSkill(id) {
        UI.showLoading(true);
        try {
            const skills = await ApiService.getSkills();
            const skill = skills.find(s => s.id === id);
            if (skill) {
                UI.showSkillModal(skill);
            }
        } catch (error) {
            console.error('Error loading skill:', error);
            UI.showToast('Failed to load skill', 'error');
        } finally {
            UI.showLoading(false);
        }
    }

    static async deleteSkill(id) {
        if (!confirm('Are you sure you want to delete this skill?')) {
            return;
        }

        UI.showLoading(true);
        try {
            await ApiService.deleteSkill(id);
            const skills = await ApiService.getSkills();
            UI.renderSkills(skills);
            UI.showToast('Skill deleted successfully');
        } catch (error) {
            console.error('Error deleting skill:', error);
            UI.showToast('Failed to delete skill', 'error');
        } finally {
            UI.showLoading(false);
        }
    }

    static async editProject(id) {
        UI.showLoading(true);
        try {
            const projects = await ApiService.getProjects();
            const project = projects.find(p => p.id === id);
            if (project) {
                UI.showProjectModal(project);
            }
        } catch (error) {
            console.error('Error loading project:', error);
            UI.showToast('Failed to load project', 'error');
        } finally {
            UI.showLoading(false);
        }
    }

    static async deleteProject(id) {
        if (!confirm('Are you sure you want to delete this project?')) {
            return;
        }

        UI.showLoading(true);
        try {
            await ApiService.deleteProject(id);
            const projects = await ApiService.getProjects();
            UI.renderProjects(projects);
            UI.showToast('Project deleted successfully');
        } catch (error) {
            console.error('Error deleting project:', error);
            UI.showToast('Failed to delete project', 'error');
        } finally {
            UI.showLoading(false);
        }
    }

    static async handleProjectSubmit(event) {
        event.preventDefault();
        UI.showLoading(true);

        try {
            const formData = new FormData(event.target);
            const projectData = {
                title: formData.get('title'),
                description: formData.get('description'),
                status: formData.get('status'),
                github_url: formData.get('github_url'),
                docs_url: formData.get('docs_url'),
                live_url: formData.get('live_url') || undefined,
                tech_stack: formData.get('tech_stack') ? 
                    formData.get('tech_stack').split(',').map(tech => tech.trim()) : 
                    undefined
            };

            const projectId = formData.get('id');
            if (projectId) {
                await ApiService.updateProject(projectId, projectData);
            } else {
                await ApiService.createProject(projectData);
            }

            UI.hideProjectModal();
            const projects = await ApiService.getProjects();
            UI.renderProjects(projects);
            UI.showToast('Project saved successfully');
        } catch (error) {
            console.error('Error saving project:', error);
            UI.showToast('Failed to save project', 'error');
        } finally {
            UI.showLoading(false);
        }
    }

    static async editSkill(id) {
        UI.showLoading(true);
        try {
            const skills = await ApiService.getSkills();
            const skill = skills.find(s => s.id === id);
            if (skill) {
                UI.showSkillModal(skill);
            }
        } catch (error) {
            console.error('Error loading skill:', error);
            UI.showToast('Failed to load skill', 'error');
        } finally {
            UI.showLoading(false);
        }
    }

    static async deleteSkill(id) {
        if (!confirm('Are you sure you want to delete this skill?')) return;

        UI.showLoading(true);
        try {
            await ApiService.deleteSkill(id);
            const skills = await ApiService.getSkills();
            UI.renderSkills(skills);
            UI.showToast('Skill deleted successfully');
        } catch (error) {
            console.error('Error deleting skill:', error);
            UI.showToast('Failed to delete skill', 'error');
        } finally {
            UI.showLoading(false);
        }
    }

    static async editProject(id) {
        UI.showLoading(true);
        try {
            const projects = await ApiService.getProjects();
            const project = projects.find(p => p.id === id);
            if (project) {
                UI.showProjectModal(project);
            }
        } catch (error) {
            console.error('Error loading project:', error);
            UI.showToast('Failed to load project', 'error');
        } finally {
            UI.showLoading(false);
        }
    }

    static async deleteProject(id) {
        if (!confirm('Are you sure you want to delete this project?')) return;

        UI.showLoading(true);
        try {
            await ApiService.deleteProject(id);
            const projects = await ApiService.getProjects();
            UI.renderProjects(projects);
            UI.showToast('Project deleted successfully');
        } catch (error) {
            console.error('Error deleting project:', error);
            UI.showToast('Failed to delete project', 'error');
        } finally {
            UI.showLoading(false);
        }
    }
}

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', () => App.initialize());