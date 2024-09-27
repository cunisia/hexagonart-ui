import { Component, Input, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  BoardWithTilesQuery,
  BoardWithTilesGQL,
  ColorEventGQL,
} from '../../../graphql/generated';
import { BOARD_ID } from '../../const';
import { TileComponent } from '../tile/tile.component';
import { UpdateCacheOnColorEventService } from '../update-cache-on-color-event.service';
import { RGBColor } from '../color.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [TileComponent],
  templateUrl: './board.component.svg',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
  @Input() selectedColor!: RGBColor;
  @Input() boardId!: string;
  board: BoardWithTilesQuery['board'];
  loading = false;

  constructor(
    private readonly updateCacheOnColorEventService: UpdateCacheOnColorEventService,
    private readonly boardWithTilesGQL: BoardWithTilesGQL,
    private readonly colorEventGQL: ColorEventGQL
  ) {}

  ngOnInit() {
    this.boardWithTilesGQL
      .watch({ boardId: this.boardId }, { notifyOnNetworkStatusChange: true })
      .valueChanges.subscribe(({ data, loading }) => {
        this.board = data.board;
        this.loading = loading;
      });

    this.colorEventGQL.subscribe({ boardId: BOARD_ID }).subscribe({
      next: ({ data }) => {
        const colorEvent = data?.colorEvent;
        if (!colorEvent) {
          return;
        }
        this.updateCacheOnColorEventService.update({
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
