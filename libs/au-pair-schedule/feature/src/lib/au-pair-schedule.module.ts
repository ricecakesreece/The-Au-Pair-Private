import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuPairScheduleComponent } from './au-pair-schedule.component';
import { AuPairScheduleRoutingModule } from './au-pair-schedule-routing.module';
import { AuPairNavbarModule } from '@the-au-pair/shared/components/aupair-navbar';
import { IonicModule } from '@ionic/angular';
import { API } from '../../../../shared/api/api.service';
import { ScheduleModalComponent } from './schedule-modal/schedule-modal.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    AuPairScheduleRoutingModule,
    AuPairNavbarModule,
    IonicModule,
    FormsModule,
  ],
  declarations: [AuPairScheduleComponent, ScheduleModalComponent],
  providers: [API],
  entryComponents: [ScheduleModalComponent],
})
export class AuPairScheduleModule {}
