import { Routes } from "@angular/router";

import { HomePageComponent } from "../home/home.component";
import { AlgorithmSortPageComponent } from "../algorithm/sort/sort.component";
import { ErrorPageComponent } from "../other/error/error.component";
import { SplashScreenPageComponent } from "../other/splash-screen/splash-screen.component";
import { LoginPageComponent } from "../other/login/login.component";
import { DashboardPageComponent } from "../dashboard/dashboard.component";
import { RegisterPageComponent } from "../other/register/register.component";

import { permissionForRegisterPage } from "../other/ngrx-store/auth.service";

export const routes: Routes = [
    { path: '', redirectTo: '/playground', pathMatch: 'full' },
    {
        path: 'playground', component: HomePageComponent, 
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardPageComponent, title: '项目导航' },
            { path: 'algorithm/sort', component: AlgorithmSortPageComponent, title: '排序算法' }
        ]
    },
    { path: 'splash-screen', component: SplashScreenPageComponent, pathMatch: 'full', title: '欢迎页面' },
    { path: 'authorization/login', component: LoginPageComponent, pathMatch: 'full', title: '登入页面' },
    { path: 'authorization/register', component: RegisterPageComponent, pathMatch: 'full', title: '注册页面', canActivate: [] },
    { path: 'error/:code', component: ErrorPageComponent, title: '错误页面' },
    { path: '**', redirectTo: 'error/404' }
];
