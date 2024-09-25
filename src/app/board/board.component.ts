import { Component, Input } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  BoardWithTilesQuery,
  BoardWithTilesGQL,
  ColorEventGQL,
} from '../../../graphql/generated';
import { BOARD_ID } from '../../const';
import { TileComponent } from '../tile/tile.component';
import { Apollo } from 'apollo-angular';
import { UpdateCacheOnColorEventService } from '../update-cache-on-color-event.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [TileComponent],
  templateUrl: './board.component.svg',
  styleUrl: './board.component.scss',
})
export class BoardComponent {
  boardId: string = BOARD_ID;
  board: BoardWithTilesQuery['board'];
  loading = false;

  constructor(
    updateCacheOnColorEventService: UpdateCacheOnColorEventService,
    boardWithTilesGQL: BoardWithTilesGQL,
    colorEventGQL: ColorEventGQL
  ) {
    boardWithTilesGQL
      .watch({ boardId: this.boardId }, { notifyOnNetworkStatusChange: true })
      .valueChanges.subscribe(({ data, loading }) => {
        this.board = data.board;
        this.loading = loading;
      });

    colorEventGQL.subscribe({ boardId: BOARD_ID }).subscribe({
      next: ({ data }) => {
        const colorEvent = data?.colorEvent;
        if (!colorEvent) {
          return;
        }
        updateCacheOnColorEventService.update({
          boardId: this.boardId,
          colorEvent,
        });
      },
    });
  }

  getTiles() {
    return this.board?.tiles ?? [];
  }
}
