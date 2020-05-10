import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'favoriteconversion'})
export class FavoriteConversionPipe implements PipeTransform {

  static unitSizes = ['', 'K', 'M', 'B', 'T', 'K.Tn', 'M.Tn', 'B.Tn', 'TnTn'];

  transform(favorites: number) {
    if (!favorites || favorites === 0) {
      return '';
    }
    const i = Math.trunc(Math.floor(Math.log(favorites) / Math.log(1000)));
    return ( (favorites / Math.pow(1000, i)).toFixed( i === 0 ? 0 : 1) ) + ' ' + FavoriteConversionPipe.unitSizes[i];
  }

}
