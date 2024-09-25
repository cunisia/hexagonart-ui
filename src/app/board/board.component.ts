import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  BoardWithTilesQuery,
  BoardWithTilesGQL,
} from '../../../graphql/generated';
import { BOARD_ID } from '../../const';
import { TileComponent } from '../tile/tile.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [TileComponent],
  templateUrl: './board.component.svg',
  styleUrl: './board.component.scss',
})
export class BoardComponent {
  board: BoardWithTilesQuery['board'];
  loading = false;

  constructor(boardWithTilesGQL: BoardWithTilesGQL) {
    boardWithTilesGQL
      .watch({ boardId: BOARD_ID }, { notifyOnNetworkStatusChange: true })
      .valueChanges.subscribe(({ data, loading }) => {
        this.board = data.board;
        this.loading = loading;
      });
  }

  getBoardStr() {
    return JSON.stringify(this.board);
  }

  getTiles() {
    return this.board?.tiles ?? [];
  }
}
