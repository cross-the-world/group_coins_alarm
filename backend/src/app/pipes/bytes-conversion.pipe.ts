import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'bytesconversion'})
export class BytesConversionPipe implements PipeTransform {

  static unitSizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  transform(bytes: number) {
    if (!bytes || bytes === 0) {
      return '';
    }
    const i = Math.trunc(Math.floor(Math.log(bytes) / Math.log(1000)));
    return ((bytes / Math.pow(1000, i)).toFixed(2)) + ' ' + BytesConversionPipe.unitSizes[i];
  }

}
