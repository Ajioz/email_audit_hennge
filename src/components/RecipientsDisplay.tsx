import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import RecipientsBadge from './RecipientsBadge' // Assuming the badge is coming from here

// Props for RecipientsDisplay
type RecipientsDisplayProps = {
  recipients: string[]
}

// Wrapper for Recipients Display
const RecipientsWrapper = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`
// Tooltip Components
const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;

  &:hover .tooltip-content {
    display: block;
  }
`

const TooltipContent = styled.div`
  display: none;
  position: absolute;
  background-color: #333;
  color: white;
  text-align: left;
  padding: 8px;
  border-radius: 4px;
  z-index: 1;
`

// Tooltip component to display all recipients
export const RecipientTooltip: React.FC<{ recipients: string[] }> = ({
  recipients,
}) => {
  return (
    <TooltipWrapper>
      <TooltipContent className="tooltip-content">
        {recipients.join(', ')}
      </TooltipContent>
    </TooltipWrapper>
  )
}

// Main Recipients Display component
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

  // Function to measure the width of text
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
          {/* Tooltip to show all recipients */}
          <RecipientTooltip recipients={recipients} />
        </>
      )}
    </RecipientsWrapper>
  )
}

export default RecipientsDisplay
