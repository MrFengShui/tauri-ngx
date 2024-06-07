import { LOCALE_ID } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";

platformBrowserDynamic().bootstrapModule(AppModule, { 
    ngZone: 'zone.js',
    providers: [{ provide: LOCALE_ID, useValue: 'zh' }]
}).catch(err => console.error(err));