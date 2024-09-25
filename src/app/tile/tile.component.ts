import { Component, Input } from '@angular/core';
import {
  BoardWithTilesDocument,
  BoardWithTilesQuery,
  BoardWithTilesQueryVariables,
  ColorTileGQL,
} from '../../../graphql/generated';
import { NgStyle } from '@angular/common';
import { USER_ID } from '../../const';
import { getRGBStr, RGBColor } from '../../utils';
import { UpdateCacheOnColorEventService } from '../update-cache-on-color-event.service';

type Tile = NonNullable<
  Pick<BoardWithTilesQuery, 'board'>['board']
>['tiles'][number];

export const TILE_WITH = 18;
export const TILE_HEIGHT = 20;
export const EXPERIMENTAL_MAGIC_RATIO = 3 / 4;
export const R = 255;
export const G = 255;
export const B = 255;
export const DEFAULT_COLOR = { r: R, g: G, b: B };

@Component({
  selector: '[tile-component]',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './tile.component.svg',
  styleUrl: './tile.component.scss',
})
export class TileComponent {
  @Input() boardId!: string;
  @Input() tile!: Tile;
  loading = false;
  tempColor: RGBColor | undefined;

  constructor(
    private readonly colorTileGQL: ColorTileGQL,
    private readonly updateCacheOnColorEventService: UpdateCacheOnColorEventService
  ) {}

  getColor() {
    if (this.loading) {
      return getRGBStr(this.tempColor ?? DEFAULT_COLOR);
    }
    const { lastColorEvent } = this.tile;
    return getRGBStr(lastColorEvent ?? DEFAULT_COLOR);
  }

  getX() {
    const { a, c } = this.tile;
    return (c + a / 2) * TILE_WITH;
  }

  getY() {
    const { a, r } = this.tile;
    return (2 * r + a) * TILE_HEIGHT * EXPERIMENTAL_MAGIC_RATIO;
  }

  colorTile() {
    const color = DEFAULT_COLOR;
    this.loading = true;
    this.colorTileGQL
      .mutate(
        {
          input: {
            tileId: this.tile.id,
            ...color,
          },
        },
        {
          useMutationLoading: true,
          // FIXME: Commented right now as it seems to double rending time since rendering og board is under optimized right now...
          // optimisticResponse: {
          //   __typename: 'Mutation',
          //   colorTile: {
          //     __typename: 'ColorTileResponse',
          //     message: 'OK',
          //     success: true,
          //     colorEvent: {
          //       __typename: 'ColorEvent',
          //       id: -1,
          //       createdAt: new Date(),
          //       tileId: this.tile.id,
          //       userId: USER_ID,
          //       ...color,
          //     },
          //   },
          // },
          update: (_, { data }) => {
            const colorEvent = data?.colorTile.colorEvent;
            if (!colorEvent) {
              return;
            }

            this.updateCacheOnColorEventService.update({
              boardId: this.boardId,
              colorEvent,
            });
          },
        }
      )
      .subscribe({
        next: ({ data, loading }) => {
          this.loading = loading ?? false;
          console.log('---> loading = ', this.loading);
          // toto
        },
        complete: () => {
          this.loading = false;
        },
        error: ({ error }) => {
          this.loading = false;
        },
      });
  }
}
