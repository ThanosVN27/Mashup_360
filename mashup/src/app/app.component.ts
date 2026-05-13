import { Component, OnInit } from '@angular/core';
import { CoreBase, IUserContext } from '@infor-up/m3-odin';
import { UserService } from '@infor-up/m3-odin-angular';

@Component({
  selector:   'app-root',
  templateUrl: './app.component.html',
  styleUrls:  ['./app.component.css'],
})
export class AppComponent  {

  // constructor(private readonly userService: UserService) {
  //   super('AppComponent');
  // }

  // ngOnInit(): void {
  //   this.userService.getUserContext().subscribe({
  //     next:  (ctx: IUserContext) => this.logInfo(`Contexte chargé — société : ${ctx.currentCompany}`),
  //     error: (err: unknown)      => this.logError('Impossible de charger le contexte : ' + err),
  //   });
  // }
}
