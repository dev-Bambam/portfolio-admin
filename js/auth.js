class AuthService {
    static getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    }

    static setToken(token) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
    }

    static removeToken() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    }

    static getAuthHeaders() {
        const token = this.getToken();
        if (!token) {
            console.warn('No auth token found');
            throw new Error('Authentication required');
        }
        console.log('Using token:', token.substring(0, 10) + '...');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    static async login(username, password) {
        try {
            console.log('Attempting login to:', `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.LOGIN}`);
            
            // Create form data
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('grant_type', 'password');

            const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Login failed');
            }

            const data = await response.json();
            this.setToken(data.access_token);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async checkAuth() {
        try {
            const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.ME}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                this.removeToken();
                throw new Error('Authentication failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Auth check error:', error);
            throw error;
        }
    }

    static logout() {
        this.removeToken();
        window.location.reload();
    }
}