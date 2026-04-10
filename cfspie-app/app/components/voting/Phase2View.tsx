import type {VoteCount} from '../../types'
import styles from './Phase2View.module.css'

interface Props {
  participants: VoteCount[]
}

export default function Phase2View({ participants }: Props) {
  const finalists = participants.filter(p => p.is_finalist)

  if (finalists.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Los finalistas serán anunciados pronto.</p>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.header}>
        <span className={styles.tag}>Fase Final</span>
        <p className={styles.subtitle}>Estos son los finalistas seleccionados por votación popular</p>
      </div>
      <div className={styles.grid}>
        {finalists.map((p, i) => (
          <div key={p.participant_id} className={styles.card} style={{ animationDelay: `${i * 60}ms` }}>
            <div className={styles.imageWrap}>
              <img src={p.photo_url} alt={p.name} className={styles.image} />
              <div className={styles.rank}>#{i + 1}</div>
            </div>
            <div className={styles.body}>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.votes}>{p.vote_count} votos en fase 1</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}