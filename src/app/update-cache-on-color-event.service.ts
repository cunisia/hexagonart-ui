import { Injectable } from '@angular/core';
import {
  BoardWithTilesDocument,
  BoardWithTilesQuery,
  BoardWithTilesQueryVariables,
  ColorEvent,
  ColorEventFragmentFragment,
} from '../../graphql/generated';
import { Apollo } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class UpdateCacheOnColorEventService {
  constructor(private readonly apollo: Apollo) {}

  update({
    boardId,
    colorEvent,
  }: {
    boardId: string;
    colorEvent: ColorEventFragmentFragment;
  }) {
    // Read the data from our cache for this query.
    const cachedData = this.apollo.client.cache.readQuery<
      BoardWithTilesQuery,
      BoardWithTilesQueryVariables
    >({
      query: BoardWithTilesDocument,
      variables: { boardId },
    });
    const tiles = cachedData?.board?.tiles;
    if (!cachedData?.board?.tiles || !tiles) {
      // TS is a bit too stupid to understand they are the same
      return;
    }
    const tileIndex = tiles.findIndex((tile) => tile.id === colorEvent.tileId);
    const tile = tiles[tileIndex];
    if (!tile || tile.lastColorEvent?.id === colorEvent.id) {
      return;
    }
    const newTile = { ...tile, lastColorEvent: colorEvent };
    const newTiles = [...tiles];
    newTiles[tileIndex] = newTile;
    const newCachedData = {
      ...cachedData,
      board: { ...cachedData.board, tiles: newTiles },
    };
    this.apollo.client.cache.writeQuery<
      BoardWithTilesQuery,
      BoardWithTilesQueryVariables
    >({
      query: BoardWithTilesDocument,
      data: newCachedData,
      variables: { boardId },
    });
  }
}
