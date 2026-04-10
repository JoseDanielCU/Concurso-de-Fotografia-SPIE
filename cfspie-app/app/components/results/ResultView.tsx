import type {Participant, VoteCount} from '../../types'
import styles from './ResultsView.module.css'

interface Props {
  participants: VoteCount[]
}

export default function ResultsView({ participants }: Props) {
  const winner = participants.find(p => p.is_phase2_winner)
  const finalists = participants.filter(p => p.is_finalist && !p.is_phase2_winner)
    .sort((a, b) => b.votes_phase1 - a.votes_phase1)

  return (
    <div className={styles.wrap}>
      {winner ? (
        <div className={styles.winnerSection}>
          <div className={styles.crownWrap}>
            <span className={styles.crown}>♛</span>
            <h2 className={styles.winnerLabel}>Ganador</h2>
          </div>
          <div className={styles.winnerCard}>
            <div className={styles.winnerImageWrap}>
              <img src={winner.photo_url} alt={winner.name} className={styles.winnerImage} />
              <div className={styles.winnerGlow} />
            </div>
            <div className={styles.winnerBody}>
              <h3 className={styles.winnerName}>{winner.name}</h3>
              <span className={styles.winnerVotes}>{winner.votes_phase1} votos</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.pending}>Los resultados serán anunciados pronto.</div>
      )}

      {finalists.length > 0 && (
        <div className={styles.finalistsSection}>
          <h4 className={styles.finalistsTitle}>Otros finalistas</h4>
          <div className={styles.finalistsGrid}>
            {finalists.map((p) => (
              <div key={p.participant_id} className={styles.finalistCard}>
                <img src={p.photo_url} alt={p.name} className={styles.finalistImage} />
                <div className={styles.finalistBody}>
                  <span className={styles.finalistName}>{p.name}</span>
                  <span className={styles.finalistVotes}>{p.votes_phase1} votos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}