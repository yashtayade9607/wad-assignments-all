import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  email = '';
  password = '';

  constructor(private router: Router) {}

  login() {

    const data = localStorage.getItem('user');

    if (!data) {
      alert('No user found. Please register first.');
      return;
    }

    const user = JSON.parse(data);

    if (user.email === this.email && user.password === this.password) {
      alert('Login Successful');
      this.router.navigate(['/profile']);
    } else {
      alert('Invalid Email or Password');
    }
  }
}
