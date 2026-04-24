import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {

  user: any = {};

  ngOnInit() {
    const data = localStorage.getItem('user');
    if (data) {
      this.user = JSON.parse(data);
    }
  }

  logout() {
    alert('Logged Out');
    location.href = '/';   // go back to login
  }
}
