import { Component, Input } from '@angular/core';
import { BoardWithTilesQuery, ColorTileGQL } from '../../../graphql/generated';
import { NgStyle } from '@angular/common';
import { UpdateCacheOnColorEventService } from '../update-cache-on-color-event.service';
import { CartesianCoord, CoordinatesService } from '../coordinates.service';
import { ColorService, RGBColor } from '../color.service';
import { SelectedColorContextService } from '../selected-color-context.service';

type Tile = NonNullable<
  Pick<BoardWithTilesQuery, 'board'>['board']
>['tiles'][number];

export const TILE_WITH = 18;
export const TILE_HEIGHT = 20;
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

  private _tile!: Tile;
  @Input() set tile(tile: Tile) {
    this._tile = tile;
    this.cartesianCoords = this.coordinatesService.getCartesianFromHexaCoord({
      hexaCoords: tile,
      tileHeight: TILE_HEIGHT,
      tileWidth: TILE_WITH,
    });
  }
  get tile() {
    return this._tile;
  }

  private color: RGBColor;

  cartesianCoords: CartesianCoord | undefined;
  loading = false;
  tempColor: RGBColor | undefined;

  constructor(
    private readonly colorTileGQL: ColorTileGQL,
    private readonly updateCacheOnColorEventService: UpdateCacheOnColorEventService,
    private readonly colorService: ColorService,
    private readonly coordinatesService: CoordinatesService,
    private readonly selectedColorContextService: SelectedColorContextService
  ) {
    this.color = colorService.getRandomColor();
  }

  ngOnInit(): void {
    this.selectedColorContextService.selectedColor$.subscribe((value) => {
      this.color = value;
    });
  }

  getColor() {
    if (this.loading) {
      return this.colorService.getRGBStr(this.tempColor ?? DEFAULT_COLOR);
    }
    const { lastColorEvent } = this.tile;
    return this.colorService.getRGBStr(lastColorEvent ?? DEFAULT_COLOR);
  }

  colorTile() {
    const color = this.color;
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
