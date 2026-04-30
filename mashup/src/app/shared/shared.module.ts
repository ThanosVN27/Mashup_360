import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { M3OdinModule } from '@infor-up/m3-odin-angular';
import {
   SohoComponentsModule,
   SohoDataGridModule,
   SohoBusyIndicatorModule,
   SohoIconModule // Import the icon module
} from 'ids-enterprise-ng';

@NgModule({
   declarations: [],
   imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      SohoComponentsModule,
      SohoDataGridModule,
      SohoBusyIndicatorModule,
      SohoIconModule, // Add to imports
      M3OdinModule,
   ],
   exports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      SohoComponentsModule,
      SohoDataGridModule,
      SohoBusyIndicatorModule,
      SohoIconModule, // Add to exports
      M3OdinModule,
   ]
})
export class SharedModule { }
