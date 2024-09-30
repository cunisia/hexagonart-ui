import {
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { BoardWithTilesQuery, ColorTileGQL } from '../../../graphql/generated';
import { ColorService, RGBColor } from '../color.service';
import { CartesianCoord, CoordinatesService } from '../coordinates.service';
import { SelectedColorContextService } from '../selected-color-context.service';
import { UpdateCacheOnColorEventService } from '../update-cache-on-color-event.service';

export const TILE_WITH = 18;
export const TILE_HEIGHT = 20;
export const R = 255;
export const G = 255;
export const B = 255;
export const DEFAULT_COLOR = { r: R, g: G, b: B };

type Tile = NonNullable<
  Pick<BoardWithTilesQuery, 'board'>['board']
>['tiles'][number];

@Directive({
  selector: '[appTile]',
  standalone: true,
})
export class TileDirective implements OnInit, OnChanges {
  @Input() boardId!: string;

  @Input() tile!: Tile;

  private selectedColor: RGBColor;

  private cartesianCoords: CartesianCoord | undefined;
  private loading = false;
  private tempColor: RGBColor | undefined;

  constructor(
    private readonly colorTileGQL: ColorTileGQL,
    private readonly updateCacheOnColorEventService: UpdateCacheOnColorEventService,
    private readonly colorService: ColorService,
    private readonly coordinatesService: CoordinatesService,
    private readonly selectedColorContextService: SelectedColorContextService,
    private readonly destroyRef: DestroyRef,
    private el: ElementRef<SVGUseElement>
  ) {
    this.selectedColor = colorService.getRandomColor();
  }

  @HostListener('click') onClick() {
    this.colorTile();
  }

  ngOnInit() {
    const selectedColor$ =
      this.selectedColorContextService.selectedColor$.subscribe((value) => {
        this.selectedColor = value;
      });
    this.destroyRef.onDestroy(selectedColor$.unsubscribe);

    this.cartesianCoords = this.coordinatesService.getCartesianFromHexaCoord({
      hexaCoords: this.tile,
      tileHeight: TILE_HEIGHT,
      tileWidth: TILE_WITH,
    });

    this.el.nativeElement.setAttribute('x', this.cartesianCoords.x + '');
    this.el.nativeElement.setAttribute('y', this.cartesianCoords.y + '');
  }

  ngOnChanges(changes: SimpleChanges): void {
    const tileChange = Object.keys(changes).find(
      (changeName) => changeName === 'tile'
    );
    if (!!tileChange) {
      this.el.nativeElement.style.fill = this.getColor();
    }
  }

  private getColor() {
    if (this.loading) {
      return this.colorService.getRGBStr(this.selectedColor);
    }
    const { lastColorEvent } = this.tile;
    return this.colorService.getRGBStr(lastColorEvent ?? DEFAULT_COLOR);
  }

  private colorTile() {
    const color = this.selectedColor;
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
