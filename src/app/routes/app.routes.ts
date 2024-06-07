import { Routes } from "@angular/router";

import { HomePageComponent } from "../home/home.component";
import { AlgorithmSortPageComponent } from "../algorithm/sort/sort.component";
import { ErrorPageComponent } from "../other/error/error.component";
import { SplashScreenPageComponent } from "../other/splash-screen/splash-screen.component";
import { LoginPageComponent } from "../other/login/login.component";

export const routes: Routes = [
    { path: '', redirectTo: '/splash-screen', pathMatch: 'full' },
    {
        path: 'playground', component: HomePageComponent, 
        children: [
            { path: '', redirectTo: 'algorithm/sort', pathMatch: 'full' },
            { path: 'algorithm/sort', component: AlgorithmSortPageComponent, title: '排序算法' }
        ]
    },
    { path: 'splash-screen', component: SplashScreenPageComponent, pathMatch: 'full', title: '欢迎页面' },
    { path: 'login', component: LoginPageComponent, pathMatch: 'full', title: '登录页面' },
    { path: 'error/:code', component: ErrorPageComponent, title: '错误页面' },
    { path: '**', redirectTo: 'error/404' }
];
