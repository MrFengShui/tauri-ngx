import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule } from "@angular/router";
import { routes } from "./routes/app.routes";

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            preloadingStrategy: PreloadAllModules,
            useHash: true,
            onSameUrlNavigation: 'reload',
            scrollPositionRestoration: 'enabled'
        })
    ],
    exports: [RouterModule]
})
export class AppRouteModule {

}