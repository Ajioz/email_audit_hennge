import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import RecipientsBadge from './RecipientsBadge' // import of RecipientsBadge

type RecipientsDisplayProps = {
  recipients: string[]
}

const RecipientsWrapper = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const RecipientsDisplay: React.FC<RecipientsDisplayProps> = ({
  recipients,
}) => {
  const [numTruncated, setNumTruncated] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wrapperRef.current) return

    const availableWidth = wrapperRef.current.clientWidth
    let usedWidth = 0
    let visibleRecipients: string[] = []

    // Measure recipients' widths to determine how many can be displayed
    for (let i = 0; i < recipients.length; i++) {
      const email = recipients[i]
      const emailWidth = measureTextWidth(email, wrapperRef.current)
      if (usedWidth + emailWidth <= availableWidth) {
        visibleRecipients.push(email)
        usedWidth += emailWidth
      } else {
        break
      }
    }

    // Calculate how many recipients are hidden
    const hiddenCount = recipients.length - visibleRecipients.length
    setNumTruncated(hiddenCount)
  }, [recipients])

  const measureTextWidth = (text: string, element: HTMLDivElement) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const style = window.getComputedStyle(element)
    if (context && style) {
      context.font = `${style.fontSize} ${style.fontFamily}`
      return context.measureText(text).width
    }
    return 0
  }

  return (
    <RecipientsWrapper ref={wrapperRef}>
      {recipients.slice(0, recipients.length - numTruncated).join(', ')}
      {numTruncated > 0 && (
        <>
          , ...
          <RecipientsBadge numTruncated={numTruncated} />
        </>
      )}
    </RecipientsWrapper>
  )
}

export default RecipientsDisplay