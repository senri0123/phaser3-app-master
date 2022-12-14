import { Coord2 } from "../types";

/**
 * 2点間の距離を取得する
 * @param pt1 一方の点
 * @param pt2 他方の点
 * @returns 2点間の距離
 */
export function lengthBetweenPoint(pt1: Coord2, pt2: Coord2): number {
    const len = Math.sqrt((pt1.x - pt2.x) * (pt1.x - pt2.x) + (pt1.y - pt2.y) * (pt1.y - pt2.y));
    return len;
}

/**
 * 指定したベクトルに対する正規化されたベクトルを取得する
 * @param vec 正規化するベクトル
 * @returns 正規化されたベクトル
 */
export function normalizeVector(vec: Coord2): Coord2 {
    const o: Coord2 = { x: 0, y: 0 };
    const norm = lengthBetweenPoint(vec, o);
    if (norm !== 0) {
        const x = vec.x / norm;
        const y = vec.y / norm;
        return { x: x, y: y };
    }
    else {
        return { x: 0, y: 0 };
    }
}

/**
 * 始点から終点へ向かうベクトルを取得する
 * @param from 始点
 * @param to 終点
 * @returns 始点から終点へのベクトル
 */
export function getVector(from: Coord2, to: Coord2): Coord2 {
    const x = to.x - from.x;
    const y = to.y - from.y;

    return { x: x, y: y };
}