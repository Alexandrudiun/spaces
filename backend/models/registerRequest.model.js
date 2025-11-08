export class RegisterRequest {
    constructor({ email, password, name, username, location, role }) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.username = username;
        this.location = location;
        this.role = role || 'user';
        this.image = null; 
    }

    validate() {
        const errors = [];

        // Email validation
        if (!this.email) {
            errors.push('Email is required');
        } else if (!/^\S+@\S+\.\S+$/.test(this.email)) {
            errors.push('Invalid email format');
        }

        // Password validation
        if (!this.password) {
            errors.push('Password is required');
        } else if (this.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        // Name validation
        if (!this.name) {
            errors.push('Name is required');
        } else if (this.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        // Username validation
        if (!this.username) {
            errors.push('Username is required');
        } else if (this.username.trim().length < 3) {
            errors.push('Username must be at least 3 characters long');
        } else if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }

        // Role validation
        const validRoles = ['user', 'manager', 'admin'];
        if (this.role && !validRoles.includes(this.role)) {
            errors.push('Invalid role. Must be user, manager, or admin');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    getData() {
        return {
            email: this.email,
            password: this.password,
            name: this.name,
            username: this.username,
            location: this.location,
            role: this.role
        };
    }
}
