import { Component } from "@angular/core";

@Component({
    selector: 'tauri-ngx-dashboard-page',
    templateUrl: './dashboard.component.html'
})
export class DashboardPageComponent {

    datetime: number = Date.now();

}