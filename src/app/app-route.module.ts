import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule } from "@angular/router";
import { routes } from "./routes/app.routes";
import { HashLocationStrategy, LocationStrategy } from "@angular/common";

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            preloadingStrategy: PreloadAllModules,
            onSameUrlNavigation: 'reload',
            scrollPositionRestoration: 'enabled'
        })
    ],
    exports: [RouterModule],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ]
})
export class AppRouteModule {

}