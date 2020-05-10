import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'dialog-progress-bar',
  templateUrl: "./dialog_progress_bar.html",
  styleUrls: ['./dialog_progress_bar.css']
})
export class DialogProgessBar {

  constructor(
    private dialogRef: MatDialogRef<DialogProgessBar>,
    @Inject(MAT_DIALOG_DATA) data
  ) {

  }

  doClose(): void {
    this.dialogRef.close();
  }

}
