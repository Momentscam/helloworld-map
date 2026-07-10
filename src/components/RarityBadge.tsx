import type { Rarity } from '../types'

export default function RarityBadge({ rarity, small }: { rarity: Rarity; small?: boolean }) {
  return <span className={`rarity-badge rarity-${rarity}${small ? ' small' : ''}`}>{rarity}</span>
}
