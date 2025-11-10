export function registerPostValidation(
  existingUser: any,
  email: string,
  password: string,
  name: string,
  role: string
) {
  if (typeof name !== 'string' || name.trim().length === 0)
    return 'Name should be a string and cannot be empty';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  if (typeof password !== 'string' || password.length < 6)
    return 'Password must be at least 6 characters long';
  if (role !== 'owner' && role !== 'manager' && role !== 'user')
    return 'Role must be either an owner, manager or user';
  if (existingUser) return 'Email already in use';
  return null;
}

export class LoginValidator {
  static validateInput(email: any, password: any): string | null {
    if (!email || !password) {
      return 'Email and password are required';
    }
    if (typeof email !== 'string' || email.trim().length === 0) {
      return 'Email is required and must be a string';
    }
    if (typeof password !== 'string' || password.trim().length === 0) {
      return 'Password is required and must be a string';
    }
    return null;
  }
}
