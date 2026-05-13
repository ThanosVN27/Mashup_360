import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Log } from '@infor-up/m3-odin';
import { M3OdinModule } from '@infor-up/m3-odin-angular';
import { SohoComponentsModule } from 'ids-enterprise-ng'; // TODO Consider only importing individual SoHo modules in production
import { AppComponent } from './app.component';
import { StockComponent } from './components/stock/stock.component';
import { SearchComponent } from './components/search/search.component';
import { HeaderComponent } from './components/header/header.component';
import { NagivationComponent } from './components/nagivation/nagivation.component';
import { SyntheseComponent } from './components/stock/tabs/synthese/synthese.component';
import { AchatsComponent } from './components/stock/tabs/achats/achats.component';
import { ReservationsComponent } from './components/stock/tabs/reservations/reservations.component';
import { ActionsComponent } from './components/stock/tabs/actions/actions.component';
import { ContractCommandPopupComponent } from './components/stock/tabs/actions/contract-command-popup/contract-command-popup.component';
import { SohoDataGridModule } from 'ids-enterprise-ng';
import {OfPofComponent} from './components/stock/tabs/ofpof/ofpof.component';
@NgModule({
   declarations: [
      AppComponent,
      SearchComponent,
      StockComponent,
      HeaderComponent,
      NagivationComponent,
      SyntheseComponent,
      AchatsComponent,
      ReservationsComponent,
      ActionsComponent,
      ContractCommandPopupComponent,
      OfPofComponent,


   ],
   imports: [
      BrowserModule,
      CommonModule,
      FormsModule,
      SohoComponentsModule,
      SohoDataGridModule,
      M3OdinModule,
   ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
   providers: [
      {
         provide: LOCALE_ID,
         useValue: 'en-US',
      },
      {
         provide: APP_INITIALIZER,
         multi: true,
         useFactory: (locale: string) => () => {
            Soho.Locale.culturesPath = 'assets/ids-enterprise/js/cultures/';
            return Soho.Locale.set(locale).catch((err: unknown) => {
               Log.error('Failed to set IDS locale', err);
            });
         },
         deps: [LOCALE_ID],
      }
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }
