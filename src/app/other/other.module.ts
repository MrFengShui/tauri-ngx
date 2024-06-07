import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ImageModule } from 'primeng/image';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PasswordModule } from 'primeng/password';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from "primeng/api";

import { ErrorPageComponent } from "./error/error.component";
import { SplashScreenPageComponent } from "./splash-screen/splash-screen.component";
import { LoginPageComponent } from "./login/login.component";

@NgModule({
    declarations: [
        ErrorPageComponent,
        LoginPageComponent,
        SplashScreenPageComponent
    ],
    imports: [
        CommonModule,
        RouterModule,

        AvatarModule,
        AvatarGroupModule,
        ButtonModule,
        CardModule,
        DividerModule,
        IconFieldModule,
        InputIconModule,
        ImageModule,
        InputGroupModule,
        InputGroupAddonModule,
        PasswordModule,
        PanelModule,
        ProgressBarModule,
        InputTextModule,
        TagModule,
        ToastModule
    ],
    exports: [
        ErrorPageComponent,
        LoginPageComponent,
        SplashScreenPageComponent
    ],
    providers: [MessageService]
})
export class OtherModule { }