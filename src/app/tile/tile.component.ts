import { Component, Input } from '@angular/core';
import {
  BoardWithTilesDocument,
  BoardWithTilesQuery,
  BoardWithTilesQueryVariables,
  ColorTileGQL,
} from '../../../graphql/generated';
import { NgStyle } from '@angular/common';

type Tile = NonNullable<
  Pick<BoardWithTilesQuery, 'board'>['board']
>['tiles'][number];

export const TILE_WITH = 18;
export const TILE_HEIGHT = 20;
export const EXPERIMENTAL_MAGIC_RATIO = 3 / 4;

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

  constructor(private readonly colorTileGQL: ColorTileGQL) {}

  getColor() {
    const { lastColorEvent } = this.tile;
    if (!!lastColorEvent) {
      const { r, g, b } = lastColorEvent;
      return `rgb(${r}, ${g}, ${b})`;
    }
    return '#fff';
  }

  getX() {
    const { a, c } = this.tile;
    return (c + a / 2) * TILE_WITH;
  }

  getY() {
    const { a, r } = this.tile;
    return (2 * r + a) * TILE_HEIGHT * EXPERIMENTAL_MAGIC_RATIO;
  }

  getTranslate() {
    return `translate(${this.getX()}, ${this.getY()})`;
  }

  colorTile() {
    const boardId = this.boardId;

    this.colorTileGQL
      .mutate(
        {
          input: {
            tileId: this.tile.id,
            r: 255,
            g: 255,
            b: 255,
          },
        },
        {
          update: (store, { data }) => {
            const colorEvent = data?.colorTile.colorEvent;
            if (!colorEvent) {
              return;
            }
            // Read the data from our cache for this query.
            const cachedData = store.readQuery<
              BoardWithTilesQuery,
              BoardWithTilesQueryVariables
            >({
              query: BoardWithTilesDocument,
              variables: { boardId: this.boardId },
            });
            const tiles = cachedData?.board?.tiles;
            if (!cachedData?.board?.tiles || !tiles) {
              // TS is a bit too stupid to understand they are the same
              return;
            }
            const tileIndex = tiles.findIndex(
              (tile) => tile.id === this.tile.id
            );
            const tile = tiles[tileIndex];
            if (!tile) {
              return;
            }
            const newTile = { ...tile, lastColorEvent: colorEvent };
            const newTiles = [...tiles];
            newTiles[tileIndex] = newTile;
            const newCachedData = {
              ...cachedData,
              board: { ...cachedData.board, tiles: newTiles },
            };
            store.writeQuery<BoardWithTilesQuery, BoardWithTilesQueryVariables>(
              {
                query: BoardWithTilesDocument,
                data: newCachedData,
                variables: { boardId: this.boardId },
              }
            );
          },
        }
      )
      .subscribe({
        next: ({ data, loading }) => {
          this.loading = loading ?? false;
          // toto
        },
        complete: () => {
          // TODO
        },
        error: ({ error }) => {
          // TODO
        },
      });
  }
}
