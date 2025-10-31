class UI {
    static elements = {
        loginPage: document.getElementById('login-page'),
        loginForm: document.getElementById('login-form'),
        loginError: document.getElementById('login-error'),
        adminDashboard: document.getElementById('admin-dashboard'),
        loadingOverlay: document.getElementById('loading-overlay'),
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toast-message'),
        logoutBtn: document.getElementById('logout-btn'),
        navBtns: document.querySelectorAll('.nav-btn'),
        sections: document.querySelectorAll('.section'),
        
        // Profile
        profileForm: document.getElementById('profile-form'),
        socialLinksContainer: document.getElementById('social-links-container'),
        addSocialLinkBtn: document.getElementById('add-social-link'),
        
        // Skills
        skillsGrid: document.getElementById('skills-grid'),
        addSkillBtn: document.getElementById('add-skill-btn'),
        skillModal: document.getElementById('skill-modal'),
        skillForm: document.getElementById('skill-form'),
        closeSkillModal: document.getElementById('close-skill-modal'),
        
        // Projects
        projectsGrid: document.getElementById('projects-grid'),
        addProjectBtn: document.getElementById('add-project-btn'),
        projectModal: document.getElementById('project-modal'),
        projectForm: document.getElementById('project-form'),
        closeProjectModal: document.getElementById('close-project-modal'),
    };

    static showLoading(show = true) {
        this.elements.loadingOverlay.classList.toggle('hidden', !show);
    }

    static showToast(message, type = 'success') {
        this.elements.toastMessage.textContent = message;
        this.elements.toast.classList.remove('translate-x-full');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            this.elements.toast.classList.add('translate-x-full');
        }, 3000);
    }

    static showLoginError(message) {
        this.elements.loginError.textContent = message;
        this.elements.loginError.classList.remove('hidden');
    }

    static switchView(isLoggedIn) {
        this.elements.loginPage.classList.toggle('hidden', isLoggedIn);
        this.elements.adminDashboard.classList.toggle('hidden', !isLoggedIn);
    }

    static switchSection(sectionId) {
        this.elements.sections.forEach(section => {
            section.classList.toggle('hidden', section.id !== sectionId);
        });
        this.elements.navBtns.forEach(btn => {
            btn.classList.toggle('bg-gray-700', 
                btn.getAttribute('data-section') === sectionId.replace('-section', ''));
        });
    }

    // Profile UI Methods
    static renderProfile(profile) {
        const form = this.elements.profileForm;
        form.full_name.value = profile.full_name || '';
        form.nickname.value = profile.nickname || '';
        form.professional_title.value = profile.professional_title || '';
        form.bio.value = profile.bio || '';
        form.email.value = profile.email || '';
        form.phone_no.value = profile.contact?.phone_no || '';
        form.whatsapp.value = profile.contact?.whatsapp || '';

        // Clear existing social links
        const container = this.elements.socialLinksContainer;
        const template = container.querySelector('.social-link-entry');
        container.innerHTML = '';
        container.appendChild(template);

        // Add existing social links
        if (profile.social_links?.length) {
            profile.social_links.forEach((link, index) => {
                if (index === 0) {
                    // Use the existing template for the first link
                    const firstEntry = container.querySelector('.social-link-entry');
                    firstEntry.querySelector('[name="platform[]"]').value = link.platform;
                    firstEntry.querySelector('[name="url[]"]').value = link.url;
                } else {
                    this.addSocialLinkFields(link);
                }
            });
        }
    }

    static addSocialLinkFields(link = { platform: '', url: '' }) {
        const container = this.elements.socialLinksContainer;
        const template = container.querySelector('.social-link-entry').cloneNode(true);
        template.querySelector('[name="platform[]"]').value = link.platform;
        template.querySelector('[name="url[]"]').value = link.url;
        container.appendChild(template);
    }

    // Skills UI Methods
    static renderSkills(skills) {
        console.log('Rendering skills:', skills); // Debug log
        this.elements.skillsGrid.innerHTML = skills.map(skill => `
            <div class="glass-card p-6 rounded-lg space-y-4 hover-card">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-semibold code-font">${skill.name}</h3>
                    <div class="flex space-x-2">
                        <button data-action="edit" data-id="${skill.id}" class="edit-skill-btn text-blue-500 hover:text-blue-400">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button data-action="delete" data-id="${skill.id}" class="delete-skill-btn text-red-500 hover:text-red-400">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="skill-level-bar flex-1">
                        <div class="skill-level-progress" style="width: ${(skill.level / 5) * 100}%"></div>
                    </div>
                    <span class="text-sm text-indigo-300 code-font">${CONFIG.SKILL_LEVELS[skill.level - 1]}</span>
                </div>
                ${skill.category ? `
                    <span class="inline-block px-3 py-1 bg-opacity-50 bg-indigo-900 text-indigo-300 rounded-full text-sm code-font">
                        ${skill.category}
                    </span>
                ` : ''}
            </div>
        `).join('');
    }
    static showSkillModal(skill = null) {
        const form = this.elements.skillForm;
        const title = document.getElementById('skill-modal-title');
        
        form.reset();
        if (skill) {
            console.log('Editing skill:', skill); // Debug log
            title.textContent = 'Edit Skill';
            form.querySelector('[name="id"]').value = skill.id;
            form.querySelector('[name="name"]').value = skill.name;
            form.querySelector('[name="level"]').value = skill.level;
            form.querySelector('[name="category"]').value = skill.category || '';
        } else {
            title.textContent = 'Add New Skill';
            form.querySelector('[name="id"]').value = '';
        }
        
        this.elements.skillModal.classList.remove('hidden');
    }

    static hideSkillModal() {
        this.elements.skillModal.classList.add('hidden');
    }

    // Projects UI Methods
    static renderProjects(projects) {
        this.elements.projectsGrid.innerHTML = projects.map(project => `
            <div class="glass-card p-6 rounded-lg space-y-4 hover-card">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-semibold code-font">${project.title}</h3>
                    <div class="flex space-x-2">
                        <button data-action="edit" data-id="${project.id}" class="edit-project-btn text-blue-500 hover:text-blue-400">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button data-action="delete" data-id="${project.id}" class="delete-project-btn text-red-500 hover:text-red-400">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-400">${project.description}</p>
                <div class="flex flex-wrap gap-2">
                    ${project.tech_stack ? project.tech_stack.map(tech => `
                        <span class="px-2 py-1 bg-gray-700 rounded-full text-sm">
                            ${tech}
                        </span>
                    `).join('') : ''}
                </div>
                <div class="flex items-center space-x-4">
                    <span class="px-3 py-1 bg-gray-700 rounded-full text-sm">
                        ${project.status}
                    </span>
                    <div class="flex space-x-4 text-sm">
                        <a href="${project.github_url}" target="_blank" rel="noopener noreferrer" 
                           class="text-blue-500 hover:text-blue-400">
                            <i class="fab fa-github mr-1"></i>GitHub
                        </a>
                        <a href="${project.docs_url}" target="_blank" rel="noopener noreferrer"
                           class="text-blue-500 hover:text-blue-400">
                            <i class="fas fa-book mr-1"></i>Docs
                        </a>
                        ${project.live_url ? `
                            <a href="${project.live_url}" target="_blank" rel="noopener noreferrer"
                               class="text-blue-500 hover:text-blue-400">
                                <i class="fas fa-external-link-alt mr-1"></i>Live
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    static showProjectModal(project = null) {
        const form = this.elements.projectForm;
        const title = document.getElementById('project-modal-title');
        
        form.reset();
        if (project) {
            console.log('Editing project:', project); // Debug log
            title.textContent = 'Edit Project';
            form.querySelector('[name="id"]').value = project.id;
            form.querySelector('[name="title"]').value = project.title;
            form.querySelector('[name="description"]').value = project.description;
            form.querySelector('[name="status"]').value = project.status;
            form.querySelector('[name="github_url"]').value = project.github_url;
            form.querySelector('[name="live_url"]').value = project.live_url || '';
            form.querySelector('[name="docs_url"]').value = project.docs_url;
            form.querySelector('[name="tech_stack"]').value = project.tech_stack?.join(', ') || '';
        } else {
            title.textContent = 'Add New Project';
            form.querySelector('[name="id"]').value = '';
        }
        
        this.elements.projectModal.classList.remove('hidden');
    }

    static hideProjectModal() {
        this.elements.projectModal.classList.add('hidden');
    }
}