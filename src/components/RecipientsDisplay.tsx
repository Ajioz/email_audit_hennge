import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import RecipientsBadge from './RecipientsBadge'

// Props interface for RecipientsDisplay
type RecipientsDisplayProps = {
  recipients: string[]
}

// Wrapper for the whole Recipients Display, based on design specification, flex ensures the badge is aligned right
const RecipientsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; // Ensure the badge is on the far right as required
  white-space: nowrap;
  overflow: hidden;
`

// Container for the recipient list, using the built in ellipsis approach in css rle
const RecipientsListWrapper = styled.div`
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

// Tooltip Components
const TooltipWrapper = styled.div`
  position: fixed;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  background-color: #666;
  color: #f0f0f0;
  padding: 8px 16px;
  border-radius: 24px;
  z-index: 1;
`

// Tooltip component to display all recipients
export const RecipientTooltip: React.FC<{
  recipients: string[]
  isVisible: boolean
}> = ({ recipients, isVisible }) => {
  if (!isVisible) return null

  return <TooltipWrapper>{recipients.join(', ')}</TooltipWrapper>
}

// Main Recipients Display component
const RecipientsDisplay: React.FC<RecipientsDisplayProps> = ({
  recipients,
}) => {
  const [numTruncated, setNumTruncated] = useState(0) // State for number of truncated recipients
  const [isTooltipVisible, setIsTooltipVisible] = useState(false) // State for tooltip visibility
  const [visibleRecipients, setVisibleRecipients] = useState<string[]>([]) // State for visible recipients
  const wrapperRef = useRef<HTMLDivElement>(null) // Ref for the wrapper element

  useEffect(() => {
    if (!wrapperRef.current) return // Exit if ref is not set

    const availableWidth = wrapperRef.current.clientWidth // Get available width
    let usedWidth = 0 // Initialize used width
    let newVisibleRecipients: string[] = [] // Array for visible recipients

    // Measure the width of ', ...'
    const ellipsisWidth = measureTextWidth(', ...', wrapperRef.current)

    // Calculate the width of the badge
    const badgeText = `+${recipients.length - newVisibleRecipients.length}`
    const badgeWidth = measureTextWidth(badgeText, wrapperRef.current)

    // Iterate through the recipients and decide what to show
    for (let i = 0; i < recipients.length; i++) {
      const email = recipients[i] // Current recipient email
      const emailWidth = measureTextWidth(email, wrapperRef.current) // Measure email width

      // Calculate the remaining space needed for ellipsis and badge
      const remainingSpace = availableWidth - usedWidth

      if (
        i === recipients.length - 1 ||
        remainingSpace < emailWidth + ellipsisWidth + badgeWidth
      ) {
        // If there is no space for the last recipient or current email with ellipsis and badge
        break
      }

      // Add email to visible recipients and update the used width
      newVisibleRecipients.push(email)
      usedWidth += emailWidth
    }

    // Check if there is enough space for the ellipsis and badge, if not, trim more
    const totalWidthWithEllipsisAndBadge =
      usedWidth + ellipsisWidth + badgeWidth

    if (
      totalWidthWithEllipsisAndBadge > availableWidth &&
      newVisibleRecipients.length > 0
    ) {
      // Remove the last visible email if it doesn't fully fit
      newVisibleRecipients.pop()
    }

    // Calculate how many recipients are hidden
    const hiddenCount = recipients.length - newVisibleRecipients.length

    setVisibleRecipients(newVisibleRecipients) // Update state with visible recipients
    setNumTruncated(hiddenCount) // Set number of truncated recipients
  }, [recipients]) // Dependency on recipients array

  // Function to measure the width of text
  const measureTextWidth = (text: string, element: HTMLDivElement) => {
    const canvas = document.createElement('canvas') // Create a canvas element
    const context = canvas.getContext('2d') // Get 2D context
    const style = window.getComputedStyle(element) // Get computed styles of the element
    if (context && style) {
      context.font = `${style.fontSize} ${style.fontFamily}` // Set font for measurement
      return context.measureText(text).width // Measure and return text width
    }
    return 0 // Return 0 if context is not available
  }

  return (
    <RecipientsWrapper ref={wrapperRef}>
      {/* This section handles the recipients display and truncation */}
      <RecipientsListWrapper>
        {recipients.length === 1 ? (
          // Special case for a single recipient, truncate it with ellipsis if necessary
          <span>{recipients[0]}</span>
        ) : (
          <>
            {visibleRecipients.join(', ')}
            {numTruncated > 0 && ', ...'}
          </>
        )}
      </RecipientsListWrapper>

      {/* The RecipientsBadge remains fixed on the far right */}
      {numTruncated > 0 && (
        <>
          <RecipientsBadge
            numTruncated={numTruncated} // Pass number of truncated recipients
            onMouseEnter={() => setIsTooltipVisible(true)} // Show tooltip on mouse enter
            onMouseLeave={() => setIsTooltipVisible(false)} // Hide tooltip on mouse leave
          />
          {/* Tooltip to show all recipients */}
          <RecipientTooltip
            recipients={recipients} // Pass all recipients to tooltip
            isVisible={isTooltipVisible} // Pass tooltip visibility state
          />
        </>
      )}
    </RecipientsWrapper>
  )
}

export default RecipientsDisplay


