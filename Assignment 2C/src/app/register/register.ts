import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';   // ADD THIS

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private router: Router) {}

  register() {

    // Basic Validation
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      alert('All fields are required');
      return;
    }

    if (this.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const user = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    // Save user
    localStorage.setItem('user', JSON.stringify(user));

    alert('Registration Successful');

    // Clear fields
    this.name = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';

    // Navigate to Login
    this.router.navigate(['/']);
  }
}
